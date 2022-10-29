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
	MantineProvider 
} from '@mantine/core';


function VariantDrawer({ opened, setOpened }) {



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
							},
						}),
					},
				},
			}}
		>
			<Drawer
				position='bottom'
				opened={opened}
				onClose={() => setOpened(false)}
				size='md'
				title='register'
				padding='xl'
			>
				<Container>
					<div>hello</div>
				</Container>
			</Drawer>
		</MantineProvider>
	);
}

export default VariantDrawer;
