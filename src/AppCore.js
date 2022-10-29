import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";

import Entry from './Entry'
import Booking from './Booking'
import Process from './Process'
import Success from './Success'
import Admin from './Admin'

function AppCore() {

	//Application vars
	const [selectedServiceId, setSelectedServiceId] = useState();
	const [selectedServiceName, setSelectedServiceName] = useState();
	const [selectedServicePrice, setSelectedServicePrice] = useState();
	const [selectedServiceVariantId, setSelectedServiceVariantId] = useState();
	const [selectedServiceVariantName, setSelectedServiceVariantName] = useState();
	const [selectedServiceVariantPrice, setSelectedServiceVariantPrice] = useState();
	const [selectedDate, setSelectedDate] = useState();
	const [selectedTime, setSelectedTime] = useState();

	const [customerFirstName, setCustomerFirstName] = useState();
	const [customerLastName, setCustomerLastName] = useState();
	const [customerEmail, setCustomerEmail] = useState();
	const [customerPhone, setCustomerPhone] = useState();

	return (
			<Router basename="/app">
				<Routes>
					<Route exact path="/" element={ 
						<Entry
							setSelectedServiceId={selectedServiceId => setSelectedServiceId(selectedServiceId)}
							setSelectedServiceName={selectedServiceName => setSelectedServiceName(selectedServiceName)}
							setSelectedServicePrice={selectedServicePrice => setSelectedServicePrice(selectedServicePrice)}
							setSelectedServiceVariantId={selectedServiceVariantId => setSelectedServiceVariantId(selectedServiceVariantId)}
							setSelectedServiceVariantName={selectedServiceVariantName => setSelectedServiceVariantName(selectedServiceVariantName)}
							setSelectedServiceVariantPrice={selectedServiceVariantPrice => setSelectedServiceVariantPrice(selectedServiceVariantPrice)}
						/>} />
					<Route exact path="/booking" element={ 
						<Booking
							selectedServiceId={selectedServiceId}
							setSelectedDate={selectedDate => setSelectedDate(selectedDate)}
							setSelectedTime={selectedTime => setSelectedTime(selectedTime)}
						/>} />
					<Route exact path="/process" element={ 
						<Process
							selectedServiceId={selectedServiceId}
							selectedServiceName={selectedServiceName}
							selectedServicePrice={selectedServicePrice}
							selectedDate={selectedDate}
							selectedTime={selectedTime}
							setCustomerFirstName={customerFirstName => setCustomerFirstName(customerFirstName)}
							setCustomerLastName={customerLastName => setCustomerLastName(customerLastName)}
							setCustomerEmail={customerEmail => setCustomerEmail(customerEmail)}
							setCustomerPhone={customerPhone => setCustomerPhone(customerPhone)}
						/>} />
					<Route exact path="/success" element={ 
						<Success
							selectedServiceId={selectedServiceId}
							selectedServiceName={selectedServiceName}
							selectedServicePrice={selectedServicePrice}
							selectedDate={selectedDate}
							selectedTime={selectedTime}
							customerFirstName={customerFirstName}
							customerLastName={customerLastName}
							customerEmail={customerEmail}
							customerPhone={customerPhone}
						/>} />
					<Route exact path="/admin" element={
						<Admin
						/>} />
				</Routes>
			</Router>
		)

}

export default AppCore;