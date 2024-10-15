import React, { useState, useEffect, useRef  } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePencil } from 'react-icons/hi'; // Success and error icons
import { FiLoader } from 'react-icons/fi'; // Import loader icon
import { Dialog } from '@headlessui/react';
import { FaTimes } from 'react-icons/fa';


const AdminDashboard = () => {
  const [filteredProducts, setFilteredProducts] = useState([
    { _id: '1', title: 'New Equipment Per Listing Credit' },
    { _id: '2', title: 'Used Equipment Per Listing Credit' },
    { _id: '3', title: 'SPA Business Equipment Per Listing Credit' },
    { _id: '4', title: 'Job Provider Per Listing Credit' },
    { _id: '5', title: 'Job Offer Per Listing Credit' },
    { _id: '6', title: 'Room for Rent Per Listing Credit' },
  ]);

  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [toast2, setToast2] = useState({ show: false, type: '', message: '' });
  const [toast3, setToast3] = useState({ show: false, type: '', message: '' });

  const [Price, setPrice] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChangePriceDialogOpen, setIsChangePriceDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const [email, setEmail] = useState('');
  const [GiftQuantity, setGiftQuantity] = useState(null);
  const [productId, setProductId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [changePrice, setChangePrice] = useState('');

  const fetchPrice = async () => {
    try {
      const response = await fetch("https://medspaa.vercel.app/product/getPrice/", { method: 'GET' });
      const json = await response.json();
      if (response.ok) {
        console.log("Price", json);
        setPrice(json[0].price);
      }
    } catch (error) {
      console.error('Error fetching quantity:', error);
    }
  };

  // Show toast message
  const showToast = (type, message) => {
    
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 3000);
  };

  const showToast2 = (type, message) => {
    setToast2({ show: true, type, message });
    setTimeout(() => setToast2({ show: false, type: '', message: '' }), 3000);
  };

  const showToast3 = (type, message) => {
    setToast3({ show: true, type, message });
    setTimeout(() => setToast3({ show: false, type: '', message: '' }), 3000);
  };


  // Function to handle price change
  const handleChangePerCreditPrice = () => {
    setEditingPrice(null); // Reset editing price state
    setIsChangePriceDialogOpen(true); // Open the dialog to change per credit price
  };

  const handleConfirmChangePrice = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://medspaa.vercel.app/product/updateId/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditId: productId, price: Number(changePrice) }), // Correctly formatted body
      });
  
      if (response.ok) {
        const json = await response.json();
        fetchPrice()
        console.log(json);
        showToast2('success', json.message);
        setChangePrice('');
        setProductId('');
      } else {
        const errorData = await response.json(); // Get more details on the error
        console.error('Error response:', errorData); // Log error for debugging
        showToast2('error', errorData.message || 'Failed to update price.');
      }
    } catch (error) {
      console.error('Error during API call:', error); // Log the error for debugging
      showToast2('error', 'Error during the API call.');
    }finally{
      setLoading(false)
    }
  };
  

  useEffect(() => {
   
    fetchPrice();
  }, []);

  const handleEditPrice = (productId) => {
    setEditingPrice(productId);
  };

  

  const handleClickOutside = (event) => {
    if (dialogRef.current && !dialogRef.current.contains(event.target)) {
      setIsDialogOpen(false); // Close the dialog
      setIsChangePriceDialogOpen(false); // Close change price dialog
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSetPrice = async (productname , price) => {
    setLoading(true);
    setToast({ show: false, type: '', message: '' }); // Reset toast
  
    let product_type = '';
    switch (productname) {
      case 'New Equipment Per Listing Credit':
        product_type = 'New Equipments';
        break;
      case 'Used Equipment Per Listing Credit':
        product_type = 'Used Equipments';
        break;
      case 'SPA Business Equipment Per Listing Credit':
        product_type = 'Businesses To Purchase';
        break;
      case 'Job Provider Per Listing Credit':
        product_type = 'Provider Needed';
        break;
      case 'Job Offer Per Listing Credit':
        product_type = 'Providers Available';
        break;
      case 'Room for Rent Per Listing Credit':
        product_type = 'Spa Room For Rent';
        break;
      default:
        console.error('Unknown product type');
        setLoading(false);
        showToast('error', 'Unknown product type');
        return;
    }
  
    try {
      const response = await fetch('https://medspaa.vercel.app/product/credits/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newCredit: Number(price), // Ensure it's a number
          productType: product_type,
        }),
      });
  
      if (response.ok) {
        const json = await response.json();
        showToast('success', json.message);
  
      
      } else {
        showToast('error', 'Failed to update price.');
      }
    } catch (error) {
      showToast('error', 'Error during the API call.');
    }
  
    setLoading(false);
    setEditingPrice(null); // Exit edit mode
  };

  const sendCredit = async () => {
    if (!email || !GiftQuantity) {
        showToast('error', 'Please enter a valid email and quantity.');
        return;
    }
    setLoading(true);
    setToast({ show: false, type: '', message: '' }); // Reset toast
    try {
        const response = await fetch('https://medspaa.vercel.app/auth/updatequantity', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json', // Include content-type
            },
            body: JSON.stringify({
                email: email,
                quantity: Number(GiftQuantity),
            }),
        });

        if (response.ok) {
          console.log("success")
            const json = await response.json();
            showToast3('success', json.message || 'Credits sent successfully!');
            setGiftQuantity(null)
        } else {
            const errorData = await response.json(); // Get error message from the response
            showToast3('error', errorData.error || 'Failed to send credits.');
        }
    } catch (error) {
        console.error('Error during the API call:', error); // Log error for debugging
        showToast3('error', 'Error during the API call.');
    }finally{
      setLoading(false);

    }
};
  return (
    <>
      <div className={`flex flex-col bg-gray-50 px-3 py-6 ${isDialogOpen || isChangePriceDialogOpen ? 'blur-background' : ''}`}>
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {toast.type === 'success' ? (
              <HiOutlineCheckCircle className="w-6 h-6 mr-2" />
            ) : (
              <HiOutlineXCircle className="w-6 h-6 mr-2" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between  border-b-2 border-gray-200 pb-4 items-center">
          <div className='flex items-center justify-center'>
            <div className='bg-blue-100 p-2 mr-3 rounded-lg shadow-md max-sm:mb-2 flex items-center justify-center'>
              <span className="font-bold text-green-600">Per Credit Price: ${Price}</span>
              <button
                className="ml-4 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
                onClick={handleChangePerCreditPrice}
              >
                Change Price
              </button>
            </div>
          </div>
  
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
            <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded flex items-center" onClick={() => setIsDialogOpen(true)}>
              Gift Credits
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="flex flex-1 overflow-hidden py-10">
          <div className="w-full overflow-auto flex justify-center items-center">
            <table className="w-2/4 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr className="items-center">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listings Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Credit Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 mb-4">
                {filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap w-2/5">
  {editingPrice === product._id ? (
    <div className="flex items-center">
      <input
        type="number"
        onChange={(e) => setNewPrice(e.target.value)}
        className="border rounded-md px-2 text-center py-1 w-1/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={() => handleSetPrice(product.title, newPrice)}
        className="ml-2 bg-blue-500 text-white rounded-md px-2 py-1 flex items-center"
      >
        {loading ? (
          <FiLoader className="animate-spin mr-2" />
        ) : (
          'Set Price'
        )}
      </button>
      {/* Cancel Button */}
      <button
        onClick={() => setEditingPrice(null)} // Cancel the editing
        className="ml-2 bg-red-500 text-white rounded-md px-2 py-1 flex items-center"
      >
    <FaTimes />
      </button>
    </div>
  ) : (
    <div className="flex items-center">
      <button
        onClick={() => handleEditPrice(product._id)}
        className="ml-2 text-gray-500 hover:text-gray-700"
      >
        <HiOutlinePencil className="w-5 h-5" />
      </button>
    </div>
  )}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dialog for buying credits */}
        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div ref={dialogRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg border border-black relative">
              <button onClick={() => setIsDialogOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
              <h2 className="text-xl font-bold mb-4">Gift Credits</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Recipient's email"
                className="border border-gray-300 rounded-md px-4 py-2 w-full mb-4"
              />
              <input
                type="number"
                value={GiftQuantity}
                onChange={(e) => setGiftQuantity(e.target.value)}
                placeholder="Quantity"
                className="border border-gray-300 rounded-md px-4 py-2 w-full mb-4       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={sendCredit}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded-md flex justify-center"
              >
               {loading ? (
                              <FiLoader className="animate-spin text-center" />
                            ) : (
                              'Send Gift'
                            )}
              </button>
            </div>
          </div>
          {toast3.show && (
          <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg transition-all ${toast3.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {toast3.type === 'success' ? (
              <HiOutlineCheckCircle className="w-6 h-6 mr-2" />
            ) : (
              <HiOutlineXCircle className="w-6 h-6 mr-2" />
            )}
            <span>{toast3.message}</span>
          </div>
        )}
        </Dialog>

        {/* Dialog for changing price */}
        <Dialog open={isChangePriceDialogOpen} onClose={() => setIsChangePriceDialogOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div ref={dialogRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg border border-black relative">
              <button onClick={() => setIsChangePriceDialogOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
              <h2 className="text-xl font-bold mb-4">Change Credit Price</h2>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Product ID"
                className="border border-gray-300 rounded-md px-4 py-2 w-full mb-4       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                value={changePrice}
                onChange={(e) => setChangePrice(e.target.value)}
                placeholder="New Price"
                className="border border-gray-300 rounded-md px-4 py-2 w-full mb-4       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleConfirmChangePrice}
                className="w-full flex justify-center  bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 rounded-md"
              >
               {loading ? (
                              <FiLoader className="animate-spin text-center" />
                            ) : (
                              'Save Changes'
                            )}
              </button>
            </div>
          </div>
          {toast2.show && (
          <div className={`fixed bottom-5 right-5 flex items-center p-4 rounded-lg shadow-lg transition-all ${toast2.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {toast2.type === 'success' ? (
              <HiOutlineCheckCircle className="w-6 h-6 mr-2" />
            ) : (
              <HiOutlineXCircle className="w-6 h-6 mr-2" />
            )}
            <span>{toast2.message}</span>
          </div>
        )}
        </Dialog>
   
      </div>
    </>
  );
};

export default AdminDashboard;