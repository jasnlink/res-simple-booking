import { useState, useEffect } from 'react';

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
	ThemeIcon 
 } from '@mantine/core';

import { IconCircleCheck } from '@tabler/icons';

function Success({ selectedServiceName, selectedServicePrice, selectedDate, selectedTime,customerFirstName, customerLastName, customerEmail, customerPhone }) {

	const [loading, setLoading] = useState(false)

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
						<Group position="apart" mb="xl">
							<div>
								<Text weight={500}>{selectedServiceName}</Text>
							</div>
							<Text>
								{formatPrice(selectedServicePrice)}
							</Text>
						</Group>
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
			</Container>
		)}
		</Paper>
	);

}

export default Success;