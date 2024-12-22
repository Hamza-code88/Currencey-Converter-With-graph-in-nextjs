'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic'; // Dynamic import to prevent SSR issues

// Dynamically import Select to resolve SSR mismatch
const Select = dynamic(() => import('react-select'), { ssr: false });

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1); // State for the amount to convert
  const [fromCurrency, setFromCurrency] = useState({ value: 'USD', label: 'USD' }); // State for the source currency
  const [toCurrency, setToCurrency] = useState({ value: 'EUR', label: 'EUR' }); // State for the target currency
  const [currencies, setCurrencies] = useState([]); // State to hold the list of currencies
  const [convertedAmount, setConvertedAmount] = useState(null); // State for the converted amount
  const [loading, setLoading] = useState(false); // State to show loading indicator
  const [error, setError] = useState(null); // State to handle errors
  const [conversionRate, setConversionRate] = useState(null); // State to store conversion rate for the graph

  // Fetch currencies data on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          'https://v6.exchangerate-api.com/v6/67aa424de22fbdfb2fa9bcd7/latest/USD'
        );
        const data = await response.json();
        if (data.result === 'success') {
          // Map currency codes into react-select compatible options
          const currencyOptions = Object.keys(data.conversion_rates).map((currency) => ({
            value: currency,
            label: currency,
          }));
          setCurrencies(currencyOptions);
        } else {
          setError('Failed to fetch currency options');
        }
      } catch (err) {
        setError('Error fetching data');
      }
    };
    fetchCurrencies();
  }, []);

  // Handle the currency conversion logic
  const handleConvert = async () => {
    setLoading(true); // Start the loading indicator
    setError(null); // Clear previous errors

    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/67aa424de22fbdfb2fa9bcd7/latest/${fromCurrency.value}`
      );
      const data = await response.json();

      if (data.result === 'success') {
        // Get the conversion rate and calculate the converted amount
        const rate = data.conversion_rates[toCurrency.value];
        const convertedValue = amount * rate;
        setConversionRate(rate); // Store conversion rate for graph rendering
        setConvertedAmount(convertedValue); // Set the converted amount
      } else {
        setError('Error fetching exchange rate');
      }
    } catch (err) {
      setError('Data fetching failed'); // Handle any network or API errors
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };

  // Graph data for conversion rate visualization
  const graphData = [
    { name: toCurrency.label, value: conversionRate || 0 }, // Use the conversion rate if available
  ];

  return (
    <div className="flex justify-center items-center p-8 flex-col sm:flex-row gap-8">
     

      {/* Right Side: Currency Converter Form */}
      <div className="bg-white p-8 rounded-3xl shadow-xl sm:w-1/2">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-600">
          Currency Converter
        </h2>

        {/* Amount Input */}
        <div className="mb-6">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)} // Update amount state on change
            className="mt-3 p-4 w-full border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md bg-gray-50 text-gray-700 text-lg"
            placeholder="Enter amount"
          />
        </div>

        {/* From Currency Select */}
        <div className="mb-6">
          <label
            htmlFor="fromCurrency"
            className="block text-sm font-medium text-gray-700"
          >
            From Currency
          </label>
          {currencies.length > 0 && (
            <Select
              id="fromCurrency"
              options={currencies} // List of available currencies
              value={fromCurrency} // Currently selected source currency
              onChange={setFromCurrency} // Update source currency state
              className="mt-3"
            />
          )}
        </div>

        {/* To Currency Select */}
        <div className="mb-6">
          <label
            htmlFor="toCurrency"
            className="block text-sm font-medium text-gray-700"
          >
            To Currency
          </label>
          {currencies.length > 0 && (
            <Select
              id="toCurrency"
              options={currencies} // List of available currencies
              value={toCurrency} // Currently selected target currency
              onChange={setToCurrency} // Update target currency state
              className="mt-3"
            />
          )}
        </div>

        {/* Convert Button */}
        <button
          type="button"
          onClick={handleConvert} // Trigger conversion logic on click
          className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 shadow-lg text-lg"
        >
          {loading ? 'Converting...' : 'Convert'} {/* Show loading text if in progress */}
        </button>

        {/* Error Display */}
        {error && (
          <p className="mt-6 text-red-500 text-center font-semibold">{error}</p> // Display error messages
        )}

        {/* Converted Amount Display */}
        {convertedAmount !== null && (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-gray-800">
              {amount} {fromCurrency.label} ={' '}
              <span className="text-blue-600">
                {convertedAmount.toFixed(2)} {toCurrency.label} {/* Show converted amount */}
              </span>
            </p>
          </div>
        )}
      </div>
       {/* Left Side: Graph for Converted Currency */}
      <div className="w-6/12 sm:w-1/2 lg:w-1/2 mb-8 sm:mb-0 sm:mr-8">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-600">
          Currency Conversion Graph
        </h2>
        {conversionRate && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /> {/* Display the target currency label */}
              <YAxis /> {/* Display the conversion rate */}
              <Tooltip /> {/* Tooltip to show details on hover */}
              <Legend /> {/* Legend to identify data lines */}
              <Line type="monotone" dataKey="value" stroke="#8884d8" /> {/* Line for conversion rate */}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
