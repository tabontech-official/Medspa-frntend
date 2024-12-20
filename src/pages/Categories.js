import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiNewspaper, HiCube, HiOfficeBuilding, HiSearch, HiBriefcase, HiHome } from 'react-icons/hi';
import { Description, Dialog, DialogTitle } from '@headlessui/react';
import { FaTimes, FaShoppingBasket } from 'react-icons/fa';
import { useAuthContext } from '../Hooks/useAuthContext';
import { CreateCheckoutUrl } from '../component/Checkout';
import UseFetchUserData from '../component/fetchUser';


const CategorySelector = () => {
  const initialCategories = [
    { path: '/I_AM_LOOKING_FOR', label: 'I Am Looking For', icon: <HiSearch className="w-6 h-6" /> },
    { path: '/Used_Equipment_Listing', label: 'Post Used Equipments for Sale', icon: <HiCube className="w-6 h-6" /> },
    { path: '/New_Equipment_listing', label: 'Post New Equipments for Sale', icon: <HiNewspaper className="w-6 h-6" /> },
    { path: '/Job_Search_listing', label: 'Post Provider Job Search', icon: <HiSearch className="w-6 h-6" /> },
    { path: '/Job_Provider_listing', label: 'Post Provider Job Offer', icon: <HiBriefcase className="w-6 h-6" /> },
    { path: '/Business_Equipment_listing', label: 'Post SPA Business for Sale', icon: <HiOfficeBuilding className="w-6 h-6" /> },
    { path: '/Rent_Room_listing', label: 'Post a Spa Room for Rent', icon: <HiHome className="w-6 h-6" /> },
   
  ];
  
  const { userData, loading, error, variantId } = UseFetchUserData();
  const [credits, setCredits] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pricePerCredit, setPricePerCredit] = useState(10);
  const dialogRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuthContext();
  const [price, setPrice] = useState(10);
  const [categories, setCategories] = useState(initialCategories);
  const [requiredCredits, setRequiredCredits] = useState([]);
const navigate = useNavigate()
  // Fetching credits from localStorage and server
  const fetchQuantity = async () => {
    const id = localStorage.getItem('userid');
    if (!id) return;
    try {
      const response = await fetch(`https://medspaa.vercel.app/auth/quantity/${id}`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        const fetchedCredits = data.quantity || 0;
        setCredits(fetchedCredits);
      }
    } catch (error) {
      console.error('Error fetching quantity:', error);
    }
    
    try {
      const response = await fetch("https://medspaa.vercel.app/product/getPrice/", { method: 'GET' });
      const json = await response.json();
      if (response.ok) {
        setPrice(json[0].price);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  // Fetch required credits for each category
  const fetchRequiredCredits = async () => {
    try {
      const response = await fetch("https://medspaa.vercel.app/product/fetchRequireCredits", { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setRequiredCredits(data.data);
      }
    } catch (error) {
      console.error('Error fetching required credits:', error);
    }
  };

  useEffect(() => {
    fetchQuantity();
    fetchRequiredCredits();
  }, []);

  useEffect(() => {
    if (requiredCredits.length > 0) {
      const updatedCategories = initialCategories.map((category) => {
        const matchedProduct = requiredCredits.find(
          (product) => {
            if (category.path.includes('Used_Equipment') && product.product_type === "Used Equipments") return true;
            if (category.path.includes('New_Equipment') && product.product_type === "New Equipments") return true;
            if (category.path.includes('Business_Equipment') && product.product_type === "Businesses To Purchase") return true;
            if (category.path.includes('Job_Search') && product.product_type === "Providers Available") return true;
            if (category.path.includes('Job_Provider') && product.product_type === "Provider Needed") return true;
            if (category.path.includes('Rent_Room') && product.product_type === "Spa Room For Rent") return true;
            if (category.path.includes('I_AM_LOOKING_FOR') && product.product_type === "Looking For") return true
          }
        );

        const requiredCredit = matchedProduct ? matchedProduct.credit_required : 0;

        return {
          ...category,
          isFree: requiredCredit === 0,
          requiredCredit,
        };
      });

      setCategories(updatedCategories);
    }
  }, [requiredCredits]);

  const handleBuyNow = () => {
    const buyCreditUrl = CreateCheckoutUrl(userData, quantity, loading, error, variantId);
    console.log(buyCreditUrl);
    window.open(buyCreditUrl, "_blank");
    fetchQuantity();
  };

  const handleClickOutside = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      console.log("Fetch click outside");
      fetchQuantity();
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    console.log("Fetch click cancel");
    fetchQuantity();
    setIsDialogOpen(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (isFree) => {
    if (isFree || credits > 0) {
      setErrorMessage(''); // Clear error message on valid click
      return true;
    } else {
      
      setErrorMessage("You have no available credits. Please purchase credits to use this feature.");
      return false;
    }
  };

  return (
    <main className="flex justify-center items-center bg-gray-100 p-20 max-sm:p-5">
      <div className="w-full max-w-lg bg-white shadow-lg p-8">
        <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800 max-sm:text-xs">Choose a Category</h1>

        {/* Available Credits Section */}
        <div className="mb-6 flex justify-between items-center">
          <span className="text-lg font-medium text-gray-800 max-sm:text-xs">Available Credits: {credits}</span>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded flex items-center max-sm:text-xs"
          >
            Buy Credits <FaShoppingBasket className="ml-1" />
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 text-red-500 font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
        {categories.map(({ path, label, icon, isFree, requiredCredit }) => {
  const isDisabled = !isFree && credits <= 0;
  return (
    <Link
      to={isDisabled ? "#" : path}
      key={path}
      onClick={(e) => {
        if (!handleCategoryClick(isFree)) {
          e.preventDefault();
        } else {
          navigate(path);
        }
      }}
      className={`block w-full py-3 px-4 border-b-4 shadow-lg transition-transform transform hover:scale-105 ${
        isDisabled
          ? 'bg-gray-300 border-gray-400 text-black '
          : 'bg-blue-500 border-blue-500 hover:bg-blue-400 text-white'
      }`}
    >
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          {icon}
          <span className="text-base max-sm:text-xs font-medium mb-1">
            {label} 
          </span>
          <span className="text-sm max-sm:text-xs font-medium absolute bottom-0 left-10 text-black">
          { requiredCredit && requiredCredit > 0 ?`${requiredCredit} Credits ` : null}
          </span>

        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isFree ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {isFree ? 'Free' : 'Paid'}
        </span>
      </div>
    </Link>
  );
})}
        </div>

      </div>

      {/* Dialog for buying credits */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div ref={dialogRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg border border-black relative">
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-1">Buy Credits</h2>
            <span className="text-base">${price}/credit</span>

            <div className="flex items-center justify-between mb-4 mt-2">
              <label htmlFor="quantity" className="font-medium">Quantity:</label>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-l transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  -
                </button>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="border border-gray-300 rounded text-center w-16 py-1 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm 
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-r transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-lg font-bold">Price:${quantity * price}.00</span>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded flex justify-center items-center"
            >
              Buy Now <FaShoppingBasket className="ml-2" />
            </button>
          </div>
        </div>
      </Dialog>
    </main>
  );
};

export default CategorySelector;
