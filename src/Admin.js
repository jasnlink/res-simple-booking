import { 
	Button,
	Title,
	Container,
	Stack,
	Card,
	Text,
	Group,
	Paper,
	LoadingOverlay,
	Grid,
	NavLink,
	Divider,
	Box
} from '@mantine/core';

import { useWindowScroll } from '@mantine/hooks';

import { useState, useEffect } from 'react'
import { Link, useNavigate } from "react-router-dom";

function Admin() {

	const navMenuData = [
		{
			title: 'Appointments'
		},
		{
			title: 'Services'
		},
		{
			title: 'Categories'
		},
		{
			title: 'Business Hours'
		},
		{
			title: 'Customers'
		}
	]

	
	useEffect(() => {
		const request = process.env.REACT_APP_BACKEND_ROUTE+"/api/"
	}, [])

	const [scroll, scrollTo] = useWindowScroll();

	useEffect(() => {
		console.log('window.innerHeight', window.innerHeight)
		console.log('document.body.offsetHeight', document.body.offsetHeight)
		console.log('y: ', scroll.y)
		if ((window.innerHeight + scroll.y) >= document.body.offsetHeight) {
			// you're at the bottom of the page, load more content here.
			console.log('bottomed out son')
		}
	}, [scroll])

	const [loading, setLoading] = useState(false)
	const [selectedNav, setSelectedNav] = useState(1)

	const [pageOffset, setPageOffset] = useState(0)
	const [bookingData, setBookingData] = useState([])

	return (
		<Container p={0} m={0} fluid={true}>
			<Grid gutter={0}>
				<Grid.Col span={2}>
					<Paper p="0" m="0" sx={(theme) => ({ minHeight: '100vh', position: 'relative', borderRight: `1px solid `+theme.colors.gray[3]})}>
						<Title px={16} py={8} size="h3" align="center">
							Booking Dashboard
						</Title>
						<Divider size="xs" />
						<Container py={8} px={16}>
							{navMenuData.map((link, index) => (
								<NavLink 
									key={index}
									py={8}
									style={{ borderRadius: '8px' }}
									variant="light"
									label={link.title}
									active={selectedNav === index ? true : false}
									onClick={() => setSelectedNav(index)}
								/>
							))}
						</Container>
					</Paper>
				</Grid.Col>
				<Grid.Col span={10}>
					<Paper p={0} m={0} sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '300vh', position: 'relative'})}>
						<LoadingOverlay visible={loading} overlayBlur={2} />
						<Container size="xs" px="xs" py="xl">
							<Title size="h2" align="center">
								Upcoming Appointments
							</Title>
							<Box>

							</Box>
						</Container>
					</Paper>
				</Grid.Col>
			</Grid>
		</Container>
	)
}

export default Admin;