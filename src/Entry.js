import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";
import Axios from 'axios';

import { 
	Button,
	Title,
	Container,
	Stack,
	Card,
	Text,
	Group,
	Paper,
	LoadingOverlay
} from '@mantine/core';

import VariantDrawer from './components/VariantDrawer';

function Entry({ setSelectedServiceId, setSelectedServiceName, setSelectedServicePrice, setSelectedServiceVariantId, setSelectedServiceVariantName, setSelectedServiceVariantPrice }) {

	const [loading, setLoading] = useState(true)
	const [categories, setCategories] = useState([])
	const [services, setServices] = useState([])

	const [variantDrawerOpen, setVariantDrawerOpen] = useState(true)

	useEffect(() => {
		//fetch categories and product option groups
		const request1 = (process.env.REACT_APP_BACKEND_ROUTE+"/api/list/categories")
		const request2 = (process.env.REACT_APP_BACKEND_ROUTE+"/api/list/services")

		const requestCategories = Axios.get(request1)
		const requestServices = Axios.get(request2)

		Axios.all([requestCategories, requestServices])
		.then(Axios.spread((...responses) => {

			setCategories(responses[0].data)
			setServices(responses[1].data)
			console.log('responses[1].data',responses[1].data)
			setLoading(false)

		}))
		.catch((err) => {
			console.log("error ", err)});

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

	let navigate = useNavigate();

	function handleSelect(sId, sName, sPrice, variantExist) {
		if(variantExist) {
			setVariantDrawerOpen(true)
		} else {
			setSelectedServiceId(sId)
			setSelectedServiceName(sName)
			setSelectedServicePrice(sPrice)
			navigate('booking');
		}
	}

	return (
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh', position: 'relative'})}>
			<LoadingOverlay visible={loading} overlayBlur={2} />
			<VariantDrawer
				opened={variantDrawerOpen}
				setOpened={setVariantDrawerOpen}
			/>
			<Container size="xs" px="xs" py="xl">
				<Title size="h2" align="center">
					Ginseng Massage
				</Title>
				<Text weight={500} align="center" mb="xl">
					Book your appointment
				</Text>
				<Stack>
					{categories.map((category, index) => (
					<>
						<Title key={index} size="h2" mt="md">{category.name}</Title>
						<Stack>
							{services.map((service, index) => (
							<>
								{service.category_id === category.category_id && (

									<Card key={index} shadow="sm" p="xl" withBorder>
										<Group position="apart" mb="xs">
											<Text weight={500}>{service.name}</Text>
											<>
											{! service.variants.length && (
												<Text>
													{formatPrice(service.price)}
												</Text>
											)}
											</>
											<>
											{!! service.variants.length && (
												<Text>
													{service.variants.length} Options
												</Text>
											)}
											</>
										</Group>
										<Text mb="xl">
											{service.desc}
										</Text>
										<>
											{! service.variants.length && (
												<Button fullWidth onClick={(id, name, price) => handleSelect(service.service_id, service.name, service.price, false)}>
													Select
												</Button>
											)}
										</>
										<>
											{!! service.variants.length && (
												<Button fullWidth onClick={(id, name, price) => handleSelect(service.service_id, service.name, service.price, true)}>
													Choose Options
												</Button>
											)}
										</>
									</Card>

								)}
							</>
							))}
						</Stack>
					</>
					))}
				</Stack>
			</Container>
		</Paper>
	);
}

export default Entry;
