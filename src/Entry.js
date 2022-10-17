import { Link, useNavigate } from "react-router-dom";

import { 
	Button,
	Title,
	Container,
	Stack,
	Card,
	Text,
	Group,
	Paper,
	Accordion,
 } from '@mantine/core';

function Entry({ setSelectedService }) {

  const data = [
	{
		service_id: 0,
		title: 'Service 1',
		desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
		price: 9900,
		category_id: 0
	},
	{
		service_id: 1,
		title: 'Service 2',
		desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
		price: 19900,
		category_id: 0
	},
	{
		service_id: 2,
		title: 'Service 3',
		desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
		price: 29900,
		category_id: 1
	}
  ]

  const catData = [
	{
	  title: 'Category 1',
	  category_id: 0
	},
	{
	  title: 'Category 2',
	  category_id: 1
	}
  ]

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

	function handleSelect() {
		navigate('booking');
	}

	return (
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh'})}>
			<Container size="xs" px="xs" py="xl">
				<Title size="h2" align="center">
				  Ginseng Massage
				</Title>
				<Text weight={500} align="center" mb="xl">
				  Book your appointment
				</Text>
				<Stack>
					{catData.map((category, index) => (
					<>
						<Text key={index} weight={500} mt="md" size="xl">{category.title}</Text>
						<Stack>
							{data.map((item, index) => (
							<>
								{item.category_id === category.category_id && (

									<Card key={index} shadow="sm" p="xl" withBorder>
										<Group position="apart" mb="xs">
											<Text weight={500}>{item.title}</Text>
											<Text>
												{formatPrice(item.price)}
											</Text>
										</Group>
										<Text mb="xl">
											{item.desc}
										</Text>
										<Button fullWidth onClick={handleSelect}>
											Select
										</Button>
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
