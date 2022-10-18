import { useState, useEffect } from 'react';
import Axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import * as Yup from 'yup';
import InputMask from 'react-input-mask';

import { 
	Button,
	Title,
	Container,
	Stack,
	Card,
	Text,
	Group,
	Paper,
	Center,
	Grid,
	ActionIcon,
	Input,
 } from '@mantine/core';

import { IconArrowNarrowLeft } from '@tabler/icons';



function Process({ selectedServiceId, selectedServiceName, selectedServicePrice, selectedDate, selectedTime, setCustomerFirstName, setCustomerLastName, setCustomerEmail, setCustomerPhone }) {

	let navigate = useNavigate();
	const [loading, setLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)


	useEffect(() => {

		if(!selectedServiceId) {
			navigate('/')
		}

	}, [])

	//formats price from cents to dollars
	function formatPrice(price) {

	if (price === 0) {
		return '$0.00'
	}
	if(!price) {
		return null
	}

	price = price.toString()

	if (price.length > 2) {
		let dollars = price.slice(0, -2)
		let cents = price.slice(-2, price.length)

		return '$' + dollars + '.' + cents
	}
	if (price.length === 2) {
		return '$0.' + price
	}
	if (price.length === 1) {
		return '$0.0' + price
	}

		return null

	}

	//form validation bool
	const [formValidated, setFormValidated] = useState(false)

	//input value state
	const [inputFirstName, setInputFirstName] = useState('')
	const [inputLastName, setInputLastName] = useState('')
	const [inputEmail, setInputEmail] = useState('')
	const [inputPhone, setInputPhone] = useState('')

	let schema = Yup.object().shape({
		firstName: Yup.string().matches(/^[aA-zZ\s]+$/).required("Enter your first name."),
  		lastName: Yup.string().matches(/^[aA-zZ\s]+$/).required("Enter your last name."),
  		email: Yup.string().email().required("Enter your email address."),
  		phone: Yup.string().min(10).required("Enter your phone number.")
  	});

  	//real time form validation
  	useEffect(() => {

	    schema.validate({ 
			firstName: inputFirstName,
			lastName: inputLastName,
			email: inputEmail,
			phone: inputPhone,

		})
		.then((response) => {
			setFormValidated(true)
		})
		.catch((err) => {
	        setFormValidated(false)
	    })


	}, [inputFirstName, inputLastName, inputEmail, inputPhone])

	function handleSubmit() {

		setSubmitLoading(true)

		setCustomerFirstName(inputFirstName)
		setCustomerLastName(inputLastName)
		setCustomerEmail(inputEmail)
		setCustomerPhone(inputPhone)

		Axios.post(process.env.REACT_APP_BACKEND_ROUTE+"/api/create/booking", {
			serviceId: selectedServiceId,
			bookingDate: selectedDate,
			bookingTime: selectedTime,
			customerFirstName: inputFirstName,
			customerLastName: inputLastName,
			customerEmail: inputEmail,
			customerPhone: inputPhone,
		})
		.then((response) => {
			navigate('/success')
		})
		.catch((err) => {
	       	console.log("error ", err)});

	}

	return (
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh'})}>
		{!!loading && (
			<div>loading...</div>
		)}
		{!loading && (
			<Container style={{ position: 'relative' }} size="xs" px="xs" py="xl">
				<div style={{ position: 'absolute', top: 0, left: 0, marginTop: '1rem', marginLeft: '1rem' }}>
					<ActionIcon color="dark" radius="md" variant="outline" size="xl" onClick={() => {navigate('/booking')}}>
						<IconArrowNarrowLeft size={34} />
					</ActionIcon>
				</div>
				<Title size="h2" align="center" mb="xl">
					Ginseng Massage
				</Title>
				<Card shadow="sm" p="xl" withBorder>
					<Group position="apart" mb="md">
						<div>
							<Text weight={500}>{selectedServiceName}</Text>
						</div>
						<Text>
							{formatPrice(selectedServicePrice)}
						</Text>
					</Group>
					<Card.Section p="xl" sx={(theme) => ({borderTop: `1px solid `+theme.colors.gray[3]})}>
						<Group position="apart">
							<div>
								<Text weight={500}>{selectedDate}</Text>
								<Text size="xs" color="dimmed" mt={3} mb="xl">
							        Date
								</Text>
							</div>
							<div>
								<Text>
									{selectedTime}
								</Text>
								<Text size="xs" color="dimmed" mt={3} mb="xl">
							        Time
								</Text>
							</div>
						</Group>
					</Card.Section>
				</Card>
				<Card shadow="sm" mt="xl" p="xl" withBorder>
					<Input.Wrapper mb="md" label="First name" required>
				      <Input placeholder="Your first name" value={inputFirstName} onChange={(event) => setInputFirstName(event.currentTarget.value)} />
				    </Input.Wrapper>
					<Input.Wrapper mb="md" label="Last name" required>
				      <Input placeholder="Your last name" value={inputLastName} onChange={(event) => setInputLastName(event.currentTarget.value)} />
				    </Input.Wrapper>
					<Input.Wrapper mb="md" label="Email address" required>
				      <Input placeholder="Your email" value={inputEmail} onChange={(event) => setInputEmail(event.currentTarget.value)} />
				    </Input.Wrapper>
					<Input.Wrapper mb="xl" label="Phone number" required>
				      <Input placeholder="Your phone number" value={inputPhone} onChange={(event) => setInputPhone(event.currentTarget.value)} />
				    </Input.Wrapper>
				    <Button mt="xl" fullWidth size="md" disabled={!formValidated} onClick={handleSubmit} loading={submitLoading}>
						Book appointment
					</Button>
				</Card>
			</Container>
		)}
		</Paper>
	);

}

export default Process;