import React from 'react';
import {
	Title,
	Container,
	Stack,
	Text,
	Group,
	Drawer,
	MantineProvider,
	UnstyledButton
} from '@mantine/core';
import formatPrice from '../utils/utils'


function VariantDrawer({ title, opened, setOpened, variants, onSelect }) {

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
								borderBottom: `1px solid ` + theme.colors.gray[3],
								background: 'white',
								padding: '1rem 1rem'
							}
						}),
					},
					UnstyledButton: {
						styles: (theme) => ({
							root: {
								border:
									`1px solid ` + theme.colors.gray[6],
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