import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import RTC from '../component/editor'; // Assuming RTC is the rich text editor
import { EditorState , ContentState, convertToRaw } from "draft-js";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CurrencyInput from 'react-currency-input-field';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'; 



const AddJobSearchForm = () => {
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [qualificationRequested, setQualificationRequested] = useState('');
  const [jobType, setJobType] = useState('');

  const [availability, setAvailability] = useState('');
  const [requestedYearlySalary, setRequestedYearlySalary] = useState('');
  const [positionRequestedDescription, setPositionRequestedDescription] = useState('');
  const [imageName, setImageName] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRemoveOption, setShowRemoveOption] = useState(false);
  const [images, setImages] = useState([]);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isEditing, setIsEditing] = useState(false);
  const locationData = useLocation();
  const { product } = locationData.state || {};
  const [imagePreviews, setImagePreviews] = useState([]); // Keep previews here
  const [Zip , setZip] = useState("")
  const [city , setCity] = useState("")
const [workas , setWorkAs] = useState("")
  const navigate = useNavigate()

  const usStates = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", 
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
    "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ]; 

  useEffect(() => {
    console.log(product)
    if (product) {
      setIsEditing(true);
      setLocation(product.jobListings[0].location.split("_")[1] || '');
      setCity(product.jobListings[0].location.split("_")[0] || '')
      setName(product.title || '');
      setQualificationRequested(product.jobListings[0].qualification || '');
      setJobType(product.jobListings[0].jobType || '');

      setAvailability(product.jobListings[0].availability || '');
      setRequestedYearlySalary(product.jobListings[0].requestedYearlySalary || '');
      // const textDescrip = product.jobListings[0].positionRequestedDescription.replace(/<br\s*\/?>|&nbsp;/gi, '');
      const textDescrip = product.jobListings[0].positionRequestedDescription.replace(
        /<br\s*\/?>|&nbsp;/gi, // Remove unwanted tags
        ""
      );
      setPositionRequestedDescription(textDescrip || '');
      setZip(product.jobListings[0].zip)
     setWorkAs(product.jobListings[0].availableToWorkAs || '')
     
     if (product.images && Array.isArray(product.images)) {
      const imageFiles = product.images.map(async(img) => {
        const blob = await fetch(img.src).then((r) => r.blob());
        return new File([blob], img.alt || 'product-image.jpg', { type: 'image/jpeg' });
      });

      Promise.all(imageFiles).then((files) => {
        setImages(files);
        setImagePreviews(product.images.map((img) => img.src));
      });
    }
      if (product.jobListings[0].positionRequestedDescription ) {
        const contentState = ContentState.createFromText(textDescrip);
        setEditorState(EditorState.createWithContent(contentState));
      } else {
        setEditorState(EditorState.createEmpty());
      }
  
     
    }
  }, []);
  // const resetForm = () => {
  //   setLocation('');
  //   setName('');
  //   setQualificationRequested('');
  //   setAvailability('');
  //   setRequestedYearlySalary('');
  //   setPositionRequestedDescription('');
  //   setImages([]);
  //   setImageName('');
  //   setEditorState(EditorState.createEmpty());
  // };
  // const onEditorStateChange = (newEditorState) => {
  //   setEditorState(newEditorState);
  //   const currentText = newEditorState.getCurrentContent().getPlainText("\u0001");
  //   setPositionRequestedDescription(currentText);
  // };
 
  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
  };
  const handleSubmit = async (e, status) => {
    const rawContentState = convertToRaw(editorState.getCurrentContent());
    const htmlContent = draftToHtml(rawContentState);

    const modifiedContent = htmlContent
    .replace(/<p>/g, "")
    .replace(/<\/p>/g, "<br />") // You can replace paragraph tags with <br /> or leave empty if you don't want any formatting
    .replace(/&nbsp;/g, " "); // Remove &nbsp; (non-breaking spaces) and replace with normal spaces.
   
if(!jobType){
  setError("Job Type Required");
  return;
}
    console.log(typeof availabilitydate)
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); // Start loading

    const formData = new FormData();

    if (images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image); // Append each file
      });
    }
    let fullLocation = city.concat("_", location)
    formData.append('location', fullLocation);
    formData.append('zip', Zip)

    if(isEditing){
      formData.append('title', name);
    }
    else{
      formData.append('name', name);
    }
    formData.append('qualification', qualificationRequested);
    formData.append('availability',availability);
    formData.append('requestedYearlySalary', requestedYearlySalary);
    formData.append('jobType', jobType);

    formData.append('positionRequestedDescription', modifiedContent);
    formData.append('availableToWorkAs' , workas)
    if(!isEditing){
      formData.append('status', status);
      }
    formData.append('userId', localStorage.getItem('userid')); // Get userId from local storage

    try {
      const response = await fetch(isEditing
        ? `https://medspaa.vercel.app/product/updateListing/${product.id}`
        : "https://medspaa.vercel.app/product/addJob", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      const json = await response.json();
      if (response.ok) {
        setSuccess(isEditing ? "Job updated successfully!" : json.message);
        setError('');
        setTimeout(() => setSuccess(''), 5000); // Clear success message after 5 seconds
        navigate("/")

        // if (!isEditing) {
        //   resetForm();
        // }
      } else {
        setSuccess('');
        setError(json.error);
        setTimeout(() => setError(''), 5000); // Clear error message after 5 seconds
      }
    } catch (error) {
      setSuccess('');
      setError('An unexpected error occurred.');
      setTimeout(() => setError(''), 5000); // Clear error message after 5 seconds
    } finally {
      setLoading(false); // End loading
    }
  };
// Handler for image file change
const handleImageChange = (e) => {
  const files = Array.from(e.target.files); // Get all selected files
  setImages(prevImages => [...prevImages, ...files]); // Store file objects
  const newImagePreviews = files.map(file => URL.createObjectURL(file)); // Create object URLs for preview
  setImagePreviews(prevPreviews => [...prevPreviews, ...newImagePreviews]); // Append to the existing previews
};

// Handler to remove image
const handleRemoveImage = (index) => {
  setImages(prevImages => prevImages.filter((_, i) => i !== index)); // Remove image at the specified index
  setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index)); // Remove preview at the specified index
};

  return (
    <main className="bg-gray-100 min-h-screen p-5 flex-row">
      <h1 className="text-2xl font-semibold mb-4 max-sm:text-xl">Provider Job Search Listing</h1>
      <p className="text-lg mb-8 text-gray-700">Here you can {isEditing ? "edit" : "add"} job listings to your site.</p>
      <div className="mb-4">
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
      </div>
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="flex-1 bg-white px-8 py-4 shadow-md lg:mr-8 mb-8 lg:mb-0">
          <h1 className='text-2xl font-semibold mb-4'>Job Details</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Details */}
            <div className="grid grid-cols-1 gap-6">
              {/* Location */}
              <div className='flex flex-row max-sm:flex-col '>
   
<div className="flex flex-col flex-1 mr-4 max-sm:mr-0">
  <label htmlFor="location" className="text-gray-700 text-sm font-medium mb-1">Location STATE *</label>
  <select
    id="location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    required
  >
    <option value="">Select a state</option>
    {usStates.map((state) => (
      <option key={state} value={state}>
        {state}
      </option>
    ))}
  </select>
</div>


              <div className="flex flex-col flex-1 ">
                <label htmlFor="location" className="text-gray-700 text-sm font-medium mb-1">Location ZIP CODE *</label>
                <input
                  type="number"
                  id="location"
                  value={Zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
              </div>
              </div>


              

    <div className="flex flex-col">
                <label htmlFor="name" className="text-gray-700 text-sm font-medium mb-1">City *</label>
                <input
                  type="text"
                  id="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>


              {/* Name */}
              <div className="flex flex-col">
                <label htmlFor="name" className="text-gray-700 text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              {/* Qualification Requested */}
              <div className="flex flex-col">
                <label htmlFor="qualificationRequested" className="text-gray-700 text-sm font-medium mb-1">Professional Qualifications *</label>
                <select
                  id="qualificationRequested"
                  value={qualificationRequested}
                  onChange={(e) => setQualificationRequested(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Select Qualification</option>
                  <option value="Medical Director">Medical Director</option>
                  <option value="ARPN Nurse practitioner">ARPN Nurse practitioner</option>
                  <option value="Registered Nurse">Registered Nurse</option>
                  <option value="Medical Assistant">Medical Assistant</option>
                  <option value="Aesthetician">Aesthetician</option>
                  <option value="Laser Technician">Laser Technician</option>
                  <option value="Massage therapist">Massage therapist</option>
                  <option value="Front desk clerk">Front desk clerk</option>
                </select>
              </div>


                 {/* Work As */}
                 <div className="flex flex-col">
                <label htmlFor="qualificationRequested" className="text-gray-700 text-sm font-medium mb-1">Available to work as  *</label>
                <select
                  id="Workas"
                  value={workas}
                  onChange={(e) => setWorkAs(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Select Option</option>
                  <option value="Employee W2">Employee W2</option>
                  <option value="Independant freelancer 1099 on commissions">Independant freelancer 1099 on commissions</option>
                    <option value="Both W2 and 1099">Both W2 and 1099</option>
                </select>
              </div>

              {/* Availability */}
              <div className="flex flex-col">
                <label htmlFor="availability" className="text-gray-700 text-sm font-medium mb-1">Available date*</label>
                <input
                  type="date"
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>

              {/* Requested Yearly Salary */}
              <div className="flex flex-col">
                <label htmlFor="requestedYearlySalary" className="text-gray-700 text-sm font-medium mb-1">Requested Yearly Salary *</label>

                <CurrencyInput
  id="validation-example-2-field"
  placeholder="$1,234,567"
  onValueChange={(value, name, values) => {
    const formattedValue = value ? `${parseFloat(value).toFixed(2)}` : '';
    setRequestedYearlySalary(formattedValue);
  }}
  value={requestedYearlySalary}
  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  prefix={'$'}
  step={10}
/>
              {/* job type */}

              </div>
              <div className="flex flex-col">
                <label htmlFor="jobType" className="text-gray-700 text-sm font-medium mb-1">Job Type *</label>
                <select
                  id="jobType"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Select job type</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>
              {/* Position Description */}
              <div className="mb-4">
      {/* Label for the description field */}
      <label className="block text-lg font-medium text-gray-700">{'Description* '}</label>
      
      {/* Editor container with Tailwind styles */}
      <div className="block border border-gray-200 shadow-sm max-h-[300px] overflow-hidden">
        <Editor
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          wrapperClassName="border-none"
          editorClassName="min-h-[200px] bg-white p-2"
        />
      </div>
    </div>


            
            </div>
          </form>
        </div>

        {/* Image Upload */}
        <div className="lg:w-1/3 lg:pl-8 flex-1">
          <div className="bg-gray-50 p-4 border border-gray-300 mb-4">
            <h2 className="text-2xl font-semibold mb-4">Resume</h2>
            <p className="text-gray-600 mb-4">
              Upload  Resume and Your Photo
            </p>

            {/* Image Preview */}
            {imagePreviews.length > 0 ? (
  imagePreviews.map((image, index) => (
    <div key={index} className="flex items-center mb-4">
      <img
        src={image}
        alt={`Preview ${index}`}
        className="border border-gray-300 w-14 h-14 object-cover"
      />
      <div className="ml-4 flex flex-1 items-center">
        <p className="text-sm text-gray-700 flex-1">file {index + 1}</p>
        <button
          type="button"
          onClick={() => handleRemoveImage(index)} // Call remove handler with the index
          className="text-red-500 hover:text-red-700 text-sm ml-4"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  ))
) : (
            <div className="flex items-center mb-4">
              <img
                src={"https://sp-seller.webkul.com/img/No-Image/No-Image-140x140.png"}
                alt="Preview"
                className="border border-gray-300 w-24 h-24 object-cover"
              />
              <div className="ml-4 flex flex-1 items-center">
                <p className="text-sm text-gray-700 flex-1">{imageName}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => document.getElementById('images').click()}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-4 rounded"
          >
            Upload Image
          </button>
          <input
            type="file"
                id="images"
            onChange={handleImageChange}
            multiple
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500">
          Note: Upload your resume and your photo. Recommended size: 1024x1024 and less than 15MB.

        </p>

        </div>
      </div>

      {/* Submit Button */}
      <hr className="border-t border-gray-500 my-4" />
      <div className="mt-8 flex ">
      <button
          type="submit"
          onClick={(e) => handleSubmit(e, 'active')}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 mr-4 border-blue-700 hover:border-blue-500 rounded flex items-center"
          disabled={loading}
        >
          {loading && (
            <svg
              className="w-5 h-5 mr-3 text-white animate-spin"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"
              />
            </svg>
          )}
          {isEditing ? "Update" : "Publish"}
        </button>
      {!isEditing ?(
  <button
  type="submit"
  onClick={(e) => handleSubmit(e, 'draft')}
  className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded flex items-center"
>
  Draft
</button>
      ):null
      }
      
      </div>
    </main>
  );
};

export default AddJobSearchForm;
