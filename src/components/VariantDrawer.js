import React from 'react';
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
	Drawer,
	MantineProvider,
	Divider, 
	UnstyledButton
} from '@mantine/core';


function VariantDrawer({ title, opened, setOpened, variants, onSelect }) {

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
		<MantineProvider
			inherit
			theme={{
				components: {
					Drawer: {
						styles: (theme) => ({
							drawer: {
								maxWidth:
									'568px',
								margin:
									'auto',
								borderRadius:
									'4px',
								overflow:
									'auto',
									background: 'white'
							},
							header: {
								position: 'sticky',
								top: '0',
								borderBottom: `1px solid `+theme.colors.gray[3],
								background: 'white',
								padding: '1rem 1rem'
							}
						}),
					},
					UnstyledButton: {
						styles: (theme) => ({
							root: {
								border: 
									`1px solid `+theme.colors.gray[6],
								borderRadius:
									'4px',
								padding:
									'16px 0',
								'&:hover': {
									backgroundColor: theme.fn.darken('#fff', 0.05),
								},
								'&:active': {
									backgroundColor: theme.fn.darken('#fff', 0.15),
								},
							},
						})
					}
				},
			}}
		>
			<Drawer
				size="xl"
				position='bottom'
				opened={opened}
				onClose={() => setOpened(false)}
				title={(
						<>
							<Title size="h3">{title}</Title>
						</>
					)}
			>
				<Container>
					<Text mt='sm' weight={500}>Choose your option</Text>
					<Container py='lg'>
						<Stack>
							{variants.map((variant, index) => (
								<UnstyledButton
									key={variant.variant_id}
									onClick={(id, name, price, duration) => onSelect(variant.service_id, variant.name, variant.price, variant.duration_mins)}
								>
									<Container>
										<Group position="apart">
											<Text>
												{variant.name}
											</Text>
											<Text>
												{formatPrice(variant.price)}
											</Text>
										</Group>
									</Container>
								</UnstyledButton>
							))}
						</Stack>
					</Container>
				</Container>
			</Drawer>
		</MantineProvider>
	);
}

export default VariantDrawer;
