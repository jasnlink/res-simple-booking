import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";

import Entry from './Entry'
import Booking from './Booking'

function AppCore() {

	//Application step var
	const [selectedService, setSelectedService] = useState();

    return (
    		<Router basename="/app">
				<Routes>
					<Route exact path="/" element={ 
						<Entry
							setStep={selectedService => setSelectedService(selectedService)}
						/>} />
					<Route exact path="/booking" element={ 
						<Booking
							selectedService={selectedService}
						/>} />
				</Routes>
			</Router>
      )

}

export default AppCore;