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


function VariantDrawer({ title, opened, setOpened, variants }) {


	return (
		<MantineProvider
			inherit
			theme={{
				components: {
					Drawer: {
						styles: (theme) => ({
							drawer: {
								maxWidth:
									'800px',
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
									`1px solid `+theme.colors.gray[3],
								borderRadius:
									'4px',
								padding:
									'16px 0',

							}
						})
					}
				},
			}}
		>
			<Drawer
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
					<Container>
						<Stack mt='lg'>
							{variants.map((variant, index) => (
								<Button
									variant="outline"
								>
									<Container>
										{variant.name}
									</Container>
								</Button>
							))}
						</Stack>
					</Container>
				</Container>
			</Drawer>
		</MantineProvider>
	);
}

export default VariantDrawer;
