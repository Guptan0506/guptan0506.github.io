import React, { useState, useEffect } from 'react';

// Main App component for the Query Performance Dashboard
const App = () => {
  // State to store the raw query logs input by the user
  const [queryLogs, setQueryLogs] = useState('');
  // State to store parsed query data (e.g., query text, execution time)
  const [parsedQueries, setParsedQueries] = useState([]);
  // State to store performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  // State to store index suggestions
  const [indexSuggestions, setIndexSuggestions] = useState(
    'No suggestions yet. Enter query logs and click "Analyze" or "Get AI Suggestions".'
  );
  // State for loading indicator during AI suggestion generation
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  // State for error messages
  const [error, setError] = useState('');

  /**
   * Handles changes in the query logs textarea.
   * @param {Object} e - The event object from the textarea.
   */
  const handleQueryLogsChange = (e) => {
    setQueryLogs(e.target.value);
    setError(''); // Clear any previous errors
  };

  /**
   * Parses the raw query logs into a structured format.
   * This improved parser attempts to extract query text and execution time
   * even if they are on separate lines or in slightly different formats.
   * It also tries to identify table names.
   * @returns {Array<Object>} An array of parsed query objects.
   */
  const parseQueryLogs = React.useCallback(() => {
    const logs = queryLogs.split('\n');
    const parsed = [];
    let currentQuery = '';
    let currentExecutionTime = null;

    // Regex patterns for SQL query and execution time
    const queryPattern = /(SELECT|INSERT INTO|UPDATE|DELETE FROM)\s+.*?;/i; // Matches common SQL statements ending with a semicolon
    const timePattern = /EXECUTION_TIME:\s*(\d+(\.\d+)?)\s*ms/i; // Matches execution time

    logs.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Try to match a query
      const queryMatch = trimmedLine.match(queryPattern);
      if (queryMatch) {
        currentQuery = queryMatch[0]; // Capture the full matched query
      }

      // Try to match execution time
      const timeMatch = trimmedLine.match(timePattern);
      if (timeMatch) {
        currentExecutionTime = parseFloat(timeMatch[1]);
      }

      // If both query and time are found (or if we've processed a query and found a time),
      // add it to parsed and reset for the next entry.
      // This handles cases where query and time might be on adjacent lines.
      if (currentQuery && currentExecutionTime !== null) {
        parsed.push({
          id: parsed.length,
          query: currentQuery,
          executionTime: currentExecutionTime,
        });
        currentQuery = ''; // Reset for next query
        currentExecutionTime = null; // Reset for next time
      } else if (currentQuery && index === logs.length - 1) {
        // If it's the last line and we have a query but no time,
        // add it with a default/null time (or handle as an error)
        // For simplicity, we'll still add it, but it won't contribute to time-based metrics.
        parsed.push({ id: parsed.length, query: currentQuery, executionTime: 0 }); // Default to 0 if time not found
      }
    });

    // Fallback for logs where query and time are on the same line but not ending with semicolon
    if (parsed.length === 0) {
      logs.forEach((line, index) => {
        const combinedMatch = line.match(
          /(SELECT|INSERT INTO|UPDATE|DELETE FROM)\s+.*?(?:WHERE\s+.*?)?(?:ORDER BY\s+.*?)?(?:LIMIT\s+.*?)?;\s*EXECUTION_TIME:\s*(\d+(\.\d+)?)\s*ms/i
        );
        if (combinedMatch) {
          const queryText = combinedMatch[0].split(';')[0].trim() + ';'; // Get the query part
          const executionTime = parseFloat(combinedMatch[2]); // Get the time part
          parsed.push({ id: parsed.length, query: queryText, executionTime });
        }
      });
    }
    return parsed;
  }, [queryLogs]);

  /**
   * Analyzes the parsed queries to calculate performance metrics.
   */
  const analyzePerformance = React.useCallback(() => {
    if (parsedQueries.length === 0) {
      setPerformanceMetrics(null);
      setError(
        'No valid queries found to analyze. Please ensure logs contain "EXECUTION_TIME: X ms" and a SQL query.'
      );
      return;
    }

    // Filter out queries with 0 execution time (from parsing fallback) for metrics calculation
    const queriesWithTime = parsedQueries.filter((q) => q.executionTime > 0);

    if (queriesWithTime.length === 0) {
      setPerformanceMetrics({
        totalQueries: parsedQueries.length,
        averageExecutionTime: 'N/A',
        mostFrequentQueries: [],
        slowestQueries: [],
      });
      setError('No queries with valid execution times found for performance analysis.');
      return;
    }

    const totalExecutionTime = queriesWithTime.reduce((sum, q) => sum + q.executionTime, 0);
    const averageExecutionTime = totalExecutionTime / queriesWithTime.length;

    // Identify most frequent queries
    const queryCounts = {};
    parsedQueries.forEach((q) => {
      queryCounts[q.query] = (queryCounts[q.query] || 0) + 1;
    });
    const sortedFrequentQueries = Object.entries(queryCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5); // Top 5 frequent queries

    // Identify slowest queries (only from queries with valid time)
    const sortedSlowestQueries = [...queriesWithTime]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 5); // Top 5 slowest queries

    setPerformanceMetrics({
      totalQueries: parsedQueries.length,
      averageExecutionTime: averageExecutionTime.toFixed(2),
      mostFrequentQueries: sortedFrequentQueries,
      slowestQueries: sortedSlowestQueries,
    });
    setError('');
  }, [parsedQueries]);

  /**
   * Extracts potential index candidates from queries based on WHERE and ORDER BY clauses.
   * This is a heuristic and not a complete SQL parser.
   * It also attempts to identify table names.
   * @param {Array<Object>} queries - Array of parsed query objects.
   * @returns {Object} An object containing candidate columns and identified table names.
   */
  const extractIndexCandidates = (queries) => {
    const candidateColumns = {};
    const tableNames = new Set();

    queries.forEach((q) => {
      // Extract table names from FROM, INSERT INTO, UPDATE, DELETE FROM clauses
      const fromMatch = q.query.match(
        /(?:FROM|JOIN|INSERT INTO|UPDATE|DELETE FROM)\s+([`"]?[\w.]+[`"]?)/i
      );
      if (fromMatch && fromMatch[1]) {
        tableNames.add(fromMatch[1].replace(/[`"]/g, '')); // Remove backticks/quotes
      }

      const whereMatch = q.query.match(/WHERE\s+(.*?)(?:ORDER BY|LIMIT|$)/i);
      if (whereMatch && whereMatch[1]) {
        const conditions = whereMatch[1]
          .split(/(AND|OR)/i)
          .map((s) => s.trim())
          .filter((s) => !['AND', 'OR'].includes(s.toUpperCase()));
        conditions.forEach((cond) => {
          const columnMatch = cond.match(/(\w+)\s*(=|>|<|>=|<=|LIKE|IN|BETWEEN)/i);
          if (columnMatch && columnMatch[1]) {
            const columnName = columnMatch[1].toLowerCase();
            candidateColumns[columnName] = (candidateColumns[columnName] || 0) + 1;
          }
        });
      }

      const orderByMatch = q.query.match(/ORDER BY\s+(.*?)(?:LIMIT|$)/i);
      if (orderByMatch && orderByMatch[1]) {
        const columns = orderByMatch[1].split(',').map((s) => s.trim().split(' ')[0].toLowerCase());
        columns.forEach((col) => {
          candidateColumns[col] = (candidateColumns[col] || 0) + 1;
        });
      }
    });
    return { candidateColumns, tableNames: Array.from(tableNames) };
  };

  /**
   * Generates basic index suggestions based on extracted candidates.
   */
  const generateBasicIndexSuggestions = React.useCallback(() => {
    if (parsedQueries.length === 0) {
      setIndexSuggestions('No queries to analyze for basic index suggestions.');
      return;
    }

    const { candidateColumns } = extractIndexCandidates(parsedQueries);
    const suggestions = Object.entries(candidateColumns)
      .sort(([, freqA], [, freqB]) => freqB - freqA)
      .map(
        ([column, freq]) =>
          `Consider an index on column '${column}' (used ${freq} times in WHERE/ORDER BY clauses).`
      );

    if (suggestions.length > 0) {
      setIndexSuggestions(suggestions.join('\n'));
    } else {
      setIndexSuggestions(
        'No specific index candidates identified from current logs for basic suggestions.'
      );
    }
  }, [parsedQueries]);

  /**
   * Fetches AI-powered index suggestions using the Gemini API.
   */
  const getAIIndexSuggestions = async () => {
    if (parsedQueries.length === 0) {
      setError(
        'Please provide query logs and click "Analyze" first before requesting AI suggestions.'
      );
      return;
    }

    setIsLoadingAI(true);
    setError('');
    try {
      const { candidateColumns, tableNames } = extractIndexCandidates(parsedQueries);

      let prompt = `Given the following SQL query patterns, frequently used columns, and identified table names, suggest optimal database indexes (e.g., single-column, composite, covering indexes) and explain why. Focus on performance improvement for common SQL databases like MySQL or PostgreSQL.

            Query patterns observed:
            ${parsedQueries
              .map(
                (q) =>
                  `- ${q.query} (Execution Time: ${
                    q.executionTime > 0 ? q.executionTime + 'ms' : 'N/A'
                  })`
              )
              .join('\n')}

            Frequently used columns in WHERE/ORDER BY clauses:
            ${Object.entries(candidateColumns)
              .map(([col, freq]) => `- ${col} (frequency: ${freq})`)
              .join('\n')}
            `;

      if (tableNames.length > 0) {
        prompt += `\nIdentified table names: ${tableNames.join(', ')}\n`;
      } else {
        prompt += `\nNo specific table names identified from queries. Assume common table structures.\n`;
      }

      prompt += `\nProvide your suggestions in a clear, concise format, perhaps as a bulleted list of CREATE INDEX statements or descriptions, followed by a brief explanation for each.`;

      let chatHistory = [];
      chatHistory.push({ role: 'user', parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ''; // Canvas will automatically provide the API key
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API error: ${response.status} - ${errorData.error.message || 'Unknown error'}`
        );
      }

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setIndexSuggestions(text);
      } else {
        setIndexSuggestions(
          'AI could not generate suggestions. Please try again with more detailed logs.'
        );
      }
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError(
        `Failed to get AI suggestions: ${err.message}. Please check your input and try again.`
      );
      setIndexSuggestions('Error generating AI suggestions.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Effect to re-parse queries whenever queryLogs changes
  useEffect(() => {
    const parsed = parseQueryLogs();
    setParsedQueries(parsed);
  }, [queryLogs, parseQueryLogs]);

  // Effect to re-analyze performance whenever parsedQueries changes
  useEffect(() => {
    analyzePerformance();
    generateBasicIndexSuggestions(); // Also update basic suggestions
  }, [parsedQueries, analyzePerformance, generateBasicIndexSuggestions]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans flex flex-col items-center">
      <style>
        {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                `}
      </style>

      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Query Performance Dashboard
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter your SQL query logs below. Each log line should contain a query and its execution
          time (e.g., "SELECT * FROM users WHERE id = 1; EXECUTION_TIME: 15.23 ms"). The parser is
          now more robust to handle variations.
        </p>

        <div className="mb-4">
          <label htmlFor="queryLogs" className="block text-gray-700 text-sm font-semibold mb-2">
            Query Logs:
          </label>
          <textarea
            id="queryLogs"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out resize-y min-h-[150px]"
            value={queryLogs}
            onChange={handleQueryLogsChange}
            placeholder={`Example:\nSELECT * FROM products WHERE category = 'electronics' ORDER BY price DESC; EXECUTION_TIME: 120.5 ms\nINSERT INTO orders (user_id, product_id, quantity) VALUES (101, 505, 2); EXECUTION_TIME: 5.1 ms\nSELECT name, email FROM users WHERE last_login > '2023-01-01' AND status = 'active'; EXECUTION_TIME: 350.7 ms\n\nAnother example format:\nSELECT customer_name FROM customers WHERE customer_id = 123;\nEXECUTION_TIME: 80.0 ms`}
          ></textarea>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={analyzePerformance}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Analyze Performance
          </button>
          <button
            onClick={getAIIndexSuggestions}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            disabled={isLoadingAI}
          >
            {isLoadingAI ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Get AI Index Suggestions'
            )}
          </button>
        </div>
      </div>

      {performanceMetrics && (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Query Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Summary</h3>
              <p className="text-gray-700">
                Total Queries Analyzed:{' '}
                <span className="font-bold">{performanceMetrics.totalQueries}</span>
              </p>
              <p className="text-gray-700">
                Average Execution Time:{' '}
                <span className="font-bold">{performanceMetrics.averageExecutionTime} ms</span>
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Most Frequent Queries</h3>
              {performanceMetrics.mostFrequentQueries.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {performanceMetrics.mostFrequentQueries.map(([query, count], index) => (
                    <li key={index} className="truncate text-sm" title={query}>
                      <span className="font-semibold">{count}x:</span> {query}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">No frequent queries identified.</p>
              )}
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 md:col-span-2">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Slowest Queries</h3>
              {performanceMetrics.slowestQueries.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700">
                  {performanceMetrics.slowestQueries.map((q, index) => (
                    <li key={index} className="truncate text-sm" title={q.query}>
                      <span className="font-semibold">{q.executionTime} ms:</span> {q.query}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">No slow queries identified.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Index Suggestions</h2>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-800 text-sm">
          {indexSuggestions}
        </div>
      </div>
    </div>
  );
};

export default App;
