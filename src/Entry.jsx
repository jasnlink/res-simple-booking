import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Axios from 'axios';
import useFormatPrice from './hooks/useFormatPrice';

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

function Entry({
	selectedServiceName,
	setSelectedServiceId,
	setSelectedServiceName,
	setSelectedServicePrice,
	setSelectedServiceDuration,
	setSelectedServiceVariantId,
	setSelectedServiceVariantName,
	setSelectedServiceVariantPrice,
	setSelectedServiceVariantDuration
}) {

	const [loading, setLoading] = useState(true);
	const [categories, setCategories] = useState([]);
	const [services, setServices] = useState([]);

	const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
	const [selectedVariants, setSelectedVariants] = useState([]);

	useEffect(() => {
		//fetch categories and product option groups
		const request1 = (process.env.REACT_APP_BACKEND_ROUTE + "/api/list/categories");
		const request2 = (process.env.REACT_APP_BACKEND_ROUTE + "/api/list/services");

		const requestCategories = Axios.get(request1);
		const requestServices = Axios.get(request2);

		Axios.all([requestCategories, requestServices])
		.then(Axios.spread((...responses) => {

			setCategories(responses[0].data);
			setServices(responses[1].data);
			setLoading(false);

		}))
		.catch((err) => {
			console.log("error ", err);
		});

	}, []);

	let formatPrice = useFormatPrice();
	let navigate = useNavigate();

	function handleSelect(sId, sName, sPrice, sDuration, variantExist, variants = []) {

		setSelectedServiceId(sId);
		setSelectedServiceName(sName);
		setSelectedServicePrice(sPrice);
		setSelectedServiceDuration(sDuration);

		if (variantExist) {
			setSelectedVariants(variants);
			setVariantDrawerOpen(true);
		} else {
			navigate('booking');
		}
	}

	function handleVariantSelect(vId, vName, vPrice, vDuration) {
		setVariantDrawerOpen(false);
		setSelectedServiceVariantId(vId);
		setSelectedServiceVariantName(vName);
		setSelectedServiceVariantPrice(vPrice);
		setSelectedServiceVariantDuration(vDuration);
		navigate('booking');
	}

	return (
		<Paper p="0" m="0" sx={(theme) => ({ backgroundColor: theme.colors.gray[0], minHeight: '100vh', position: 'relative' })}>
			<LoadingOverlay visible={loading} overlayBlur={2} />
			<VariantDrawer
				title={selectedServiceName}
				opened={variantDrawerOpen}
				setOpened={setVariantDrawerOpen}
				variants={selectedVariants}
				onSelect={handleVariantSelect}
			/>
			<Container size="xs" px="xs" py="xl">
				<Title size="h2" align="center">
					Ginseng Massage
				</Title>
				<Text weight={500} align="center" mb="xl">
					Book your appointment
				</Text>
				<Stack>
					{categories.map((category, cIndex) => (
						<React.Fragment key={category.category_id}>
							<Title size="h2" mt="md">{category.name}</Title>
							<Stack>
								{services.map((service, sIndex) => (
									<React.Fragment key={service.service_id}>
										{service.category_id === category.category_id && (
											<Card shadow="sm" p="xl" withBorder>
												<Group position="apart" mb="xs">
													<Text weight={500}>{service.name}</Text>
													<>
														{!service.variants.length && (
															<Text>
																{formatPrice(service.price)}
															</Text>
														)}
													</>
													<>
														{!!service.variants.length && (
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
													{!service.variants.length && (
														<Button fullWidth onClick={(id, name, price, duration) => handleSelect(service.service_id, service.name, service.price, service.duration_mins, false)}>
															Select
														</Button>
													)}
												</>
												<>
													{!!service.variants.length && (
														<Button fullWidth onClick={(id, name, price, duration) => handleSelect(service.service_id, service.name, service.price, service.duration_mins, true, service.variants)}>
															Choose Options
														</Button>
													)}
												</>
											</Card>
										)}
									</React.Fragment>
								))}
							</Stack>
						</React.Fragment>
					))}
				</Stack>
			</Container>
		</Paper>
	);
}

export default Entry;
