import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from '../DashboardPage';

expect.extend(toHaveNoViolations);

test('DashboardPage should have no detectable accessibility violations', async () => {
  const { container } = render(<DashboardPage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
