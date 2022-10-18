import { Link, useNavigate } from "react-router-dom";
import { IconArrowNarrowLeft } from '@tabler/icons';

import { 
	ActionIcon
 } from '@mantine/core';

function BackButton(navigateTo) {
	let navigate = useNavigate();
	<div style={{ position: 'absolute', top: 0, left: 0, marginTop: '1rem', marginLeft: '1rem' }}>
		<ActionIcon color="dark" radius="md" variant="outline" size="xl" onClick={() => {navigate(navigateTo)}}>
			<IconArrowNarrowLeft size={34} />
		</ActionIcon>
	</div>
}

export default BackButton