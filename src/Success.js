import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

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
	ThemeIcon,
	Divider
 } from '@mantine/core';

import { IconCircleCheck } from '@tabler/icons';

function Success({
	selectedServiceId,
	selectedServiceName,
	selectedServicePrice,
	selectedServiceDuration,
	selectedServiceVariantId,
	selectedServiceVariantName,
	selectedServiceVariantPrice,
	selectedServiceVariantDuration,
	selectedDate,
	selectedTime,customerFirstName,
	customerLastName,
	customerEmail,
	customerPhone
}) {

	let navigate = useNavigate();
	const [loading, setLoading] = useState(false)

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

	return (
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh'})}>
		{!!loading && (
			<div>loading...</div>
		)}
		{!loading && (
			<Container style={{ position: 'relative' }} size="xs" px="xs" py="xl">
				<Title size="h2" align="center" mb="xl">
					Ginseng Massage
				</Title>
				<Text weight={500} align="center" mb="xl">
					Your appointment is booked!
				</Text>
				<Card shadow="sm" p="xl" withBorder>
					<Card.Section p="xl" sx={(theme) => ({backgroundColor: theme.colors.green[6]})}>
						<Center>
							<IconCircleCheck stroke-width="1" width="128" height="128" color="white" />
						</Center>
					</Card.Section>
					<Card.Section p="xl" sx={(theme) => ({borderTop: `1px solid `+theme.colors.gray[3]})}>
						<Title size="h2" align="center" mb="xl">{customerFirstName} {customerLastName}</Title>
						<Group position="apart" mb="md">
						<div>
							<Text weight={500}>
								{selectedServiceName}
							</Text>
							{!!selectedServiceVariantId && (
								<Text pl='.5rem'>
									{selectedServiceVariantName}
								</Text>
							)}
						</div>
						{!selectedServiceVariantId && (
							<>
								<div>
									<Text size="xs" color="dimmed" mb={3}>
										Duration
									</Text>
									<Text>
										{selectedServiceDuration} mins
									</Text>
								</div>
								<div>
									<Text size="xs" color="dimmed" mb={3}>
										Price
									</Text>
									<Text>
										{formatPrice(selectedServicePrice)}
									</Text>
								</div>
							</>
						)}
						{!!selectedServiceVariantId && (
							<>
								<div>
									<Text size="xs" color="dimmed" mb={3}>
										Duration
									</Text>
									<Text>
										{selectedServiceVariantDuration} mins
									</Text>
								</div>
								<div>
									<Text size="xs" color="dimmed" mb={3}>
										Price
									</Text>
									<Text>
										{formatPrice(selectedServiceVariantPrice)}
									</Text>
								</div>
							</>
						)}
						</Group>
						<Divider my="1.5rem" mx="-1.5rem" />
						<Group position="apart">
							<div>
								<Text size="xs" color="dimmed" mb={3}>
									Date
								</Text>
								<Text weight={500}>{selectedDate}</Text>
							</div>
							<div>
								<Text size="xs" color="dimmed" mb={3}>
									Time
								</Text>
								<Text>
									{selectedTime}
								</Text>
							</div>
						</Group>
					</Card.Section>
				</Card>
			</Container>
		)}
		</Paper>
	);

}

export default Success;