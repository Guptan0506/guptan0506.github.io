import React, { useState, createContext, useContext, useEffect } from 'react';

// Product data (mocked)
const productsData = [
  {
    id: 1,
    name: 'Vintage Camera',
    description: 'Capture timeless moments with this classic film camera.',
    price: 299.99,
    imageUrl: 'https://placehold.co/400x300/FEE2E2/DC2626?text=Camera',
  },
  {
    id: 2,
    name: 'Noise-Cancelling Headphones',
    description: 'Immerse yourself in pure audio with superior noise cancellation.',
    price: 199.99,
    imageUrl: 'https://placehold.co/400x300/DBEAFE/2563EB?text=Headphones',
  },
  {
    id: 3,
    name: 'Smartwatch Pro',
    description: 'Stay connected and track your fitness with this advanced smartwatch.',
    price: 249.99,
    imageUrl: 'https://placehold.co/400x300/D1FAE5/059669?text=Smartwatch',
  },
  {
    id: 4,
    name: 'Ergonomic Office Chair',
    description: 'Work in comfort and style with this premium ergonomic chair.',
    price: 450.00,
    imageUrl: 'https://placehold.co/400x300/E9D5FF/8B5CF6?text=Chair',
  },
  {
    id: 5,
    name: 'Portable Bluetooth Speaker',
    description: 'Enjoy crisp, powerful sound on the go.',
    price: 89.99,
    imageUrl: 'https://placehold.co/400x300/FFEDD5/F97316?text=Speaker',
  },
  {
    id: 6,
    name: '4K Ultra HD Monitor',
    description: 'Experience stunning visuals with vibrant colors and sharp details.',
    price: 349.99,
    imageUrl: 'https://placehold.co/400x300/ECFDF5/0F766E?text=Monitor',
  },
];

// Create a context for the shopping cart
const CartContext = createContext();

// Cart Provider component
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage if available
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  });

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// --- Components ---

// Header component
const Header = ({ navigate, activePage }) => {
  const { getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-extrabold cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => navigate('products')}>
          ShopSphere
        </h1>
        <nav className="flex space-x-6">
          <button
            className={`text-lg font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
              activePage === 'products' ? 'bg-white text-blue-700 shadow-md' : 'hover:bg-blue-500/30'
            }`}
            onClick={() => navigate('products')}
          >
            Products
          </button>
          <button
            className={`relative text-lg font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
              activePage === 'cart' ? 'bg-white text-blue-700 shadow-md' : 'hover:bg-blue-500/30'
            }`}
            onClick={() => navigate('cart')}
          >
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

// Product Card component
const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover object-center rounded-t-xl"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/E5E7EB/1F2937?text=Image+Error`; }}
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-extrabold text-blue-600">${product.price.toFixed(2)}</span>
          <button
            onClick={() => addToCart(product)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Product List component
const ProductList = () => {
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in">
        Our Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productsData.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// Cart Item component
const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useContext(CartContext);

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md p-4 mb-4 transform transition-all duration-300 hover:scale-[1.01]">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-24 h-24 object-cover rounded-md mr-4"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x96/E5E7EB/1F2937?text=Image+Error`; }}
      />
      <div className="flex-grow">
        <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-full transition-colors duration-200"
        >
          -
        </button>
        <span className="text-lg font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-full transition-colors duration-200"
        >
          +
        </button>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        className="ml-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
      >
        Remove
      </button>
    </div>
  );
};

// Shopping Cart component
const Cart = ({ navigate }) => {
  const { cartItems, getTotalPrice, clearCart } = useContext(CartContext);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 text-center animate-fade-in">
        Your Shopping Cart
      </h2>
      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-xl border-dashed border-2 border-gray-300">
          <p className="text-2xl text-gray-600 font-medium mb-4">Your cart is empty!</p>
          <button
            onClick={() => navigate('products')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="md:col-span-1 bg-white rounded-lg shadow-xl p-6 h-fit sticky top-24">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">Order Summary</h3>
            <div className="flex justify-between items-center text-xl font-medium text-gray-700 mb-3">
              <span>Total Items:</span>
              <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-extrabold text-blue-700 mb-6 border-t pt-4">
              <span>Total Price:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <button
              onClick={() => navigate('checkout')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-3"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Checkout Page component
const Checkout = ({ navigate }) => {
  const { getTotalPrice, clearCart } = useContext(CartContext);
  const totalPrice = getTotalPrice();

  const handlePlaceOrder = () => {
    // In a real MERN app, this would send data to the backend for payment processing
    // and order creation.
    // For this demo, we'll just simulate success and clear the cart.
    alert(`Order placed successfully for $${totalPrice.toFixed(2)}! Thank you for your purchase.`);
    clearCart();
    navigate('products'); // Go back to products page
  };

  const handleReturnToCart = () => {
    navigate('cart');
  };

  return (
    <div className="container mx-auto p-6 min-h-[calc(100vh-100px)] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Checkout</h2>

        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xl text-gray-700 font-medium mb-2">Your total:</p>
          <p className="text-5xl font-extrabold text-blue-700">${totalPrice.toFixed(2)}</p>
        </div>

        {/* This is where a real payment form/integration would go */}
        <div className="mb-6">
          <p className="text-lg text-gray-600">
            This is a simulated checkout. In a real application, you would integrate with a payment
            gateway (e.g., Stripe, PayPal) here.
          </p>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
        >
          Place Order (Simulated)
        </button>
        <button
          onClick={handleReturnToCart}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          Return to Cart
        </button>
      </div>
    </div>
  );
};

// Custom Alert component (replaces browser's alert)
const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center transform scale-100 animate-scale-in">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Notification</h3>
        <p className="text-gray-700 text-lg mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          OK
        </button>
      </div>
    </div>
  );
};


// Main App component
export default function App() {
  const [currentPage, setCurrentPage] = useState('products');
  const [alertMessage, setAlertMessage] = useState('');

  // Override global alert for custom message box
  useEffect(() => {
    window.alert = (message) => setAlertMessage(message);
    return () => {
      // Restore original alert function if needed, though for this isolated app it's fine.
      // delete window.alert; // Or store original and restore
    };
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
  };

  let PageComponent;
  switch (currentPage) {
    case 'products':
      PageComponent = ProductList;
      break;
    case 'cart':
      PageComponent = Cart;
      break;
    case 'checkout':
      PageComponent = Checkout;
      break;
    default:
      PageComponent = ProductList; // Default to products
  }

  return (
    <CartProvider>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Custom scrollbar for better aesthetics */
          ::-webkit-scrollbar {
            width: 10px;
          }
          ::-webkit-scrollbar-track {
            background: #e0e0e0;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          /* Tailwind CSS is loaded via CDN in the parent environment */
          /* Keyframe for fade-in animation */
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.8s ease-out forwards;
          }

          /* Keyframe for bounce animation */
          @keyframes bounce {
            0%, 100% { transform: translateY(-25%) }
            50% { transform: translateY(0) }
          }
          .animate-bounce {
            animation: bounce 1s infinite;
          }

          /* Keyframe for scale-in animation */
          @keyframes scale-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scale-in 0.3s ease-out forwards;
          }
        `}
      </style>
      <Header navigate={navigate} activePage={currentPage} />
      <main className="min-h-screen pb-10">
        <PageComponent navigate={navigate} />
      </main>
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage('')} />
    </CartProvider>
  );
}

// Ensure Tailwind CSS is loaded from CDN
// This script will be injected into the HTML head by the Canvas environment.
// <script src="https://cdn.tailwindcss.com"></script>
