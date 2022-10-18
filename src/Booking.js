import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat'

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
	ActionIcon
 } from '@mantine/core';

import { IconArrowNarrowLeft } from '@tabler/icons';
import { Calendar } from '@mantine/dates';

function Booking({ selectedServiceId, setSelectedDate, setSelectedTime }) {

	dayjs.extend(duration)
	dayjs.extend(customParseFormat)
	let navigate = useNavigate();

	let timegroupData = [
		// {
		// 	timegroup_id: 0,
		// 	day: 0,
		// 	open: '9:00:00',
		// 	close: '17:00:00'
		// },
		{
			timegroup_id: 1,
			day: 1,
			open: '9:00:00',
			close: '17:00:00'
		},
		{
			timegroup_id: 2,
			day: 2,
			open: '9:00:00',
			close: '17:00:00'
		},
		{
			timegroup_id: 3,
			day: 3,
			open: '9:00:00',
			close: '13:00:00'
		},
		{
			timegroup_id: 4,
			day: 4,
			open: '9:00:00',
			close: '17:00:00'
		},
		{
			timegroup_id: 5,
			day: 5,
			open: '9:00:00',
			close: '17:00:00'
		},
		// {
		// 	timegroup_id: 6,
		// 	day: 6,
		// 	open: '9:00:00',
		// 	close: '17:00:00'
		// },
	]

	const [loading, setLoading] = useState(true)

	const [calendarValue, setCalendarValue] = useState(null);
	const [closedBusinessDays, setClosedBusinessDays] = useState(null);
	const [displayDate, setDisplayDate] = useState('')
	const [timeslotData, setTimeslotData] = useState([])

	// handles determining which days are closed from the received timegroup data
	async function getClosedBusinessDays() {

		return new Promise((resolve, reject) => {

			let res = []
			let days = [0,1,2,3,4,5,6]

			for(let timegroup of timegroupData) {
				days = days.filter(day => day !== timegroup.day)
			}
			resolve(setClosedBusinessDays(days))

		})
	}

	// handles resolving which days are closed into the calendar, used in the calendar's excludeDate
	function handleExcludeDays(date) {

		for(let day of closedBusinessDays) {
			if(date.getDay() === day) {
				return true
			}
		}
	}

	useEffect(() => {

		getClosedBusinessDays()
		.then(() => {
			setLoading(false)
		})

	}, [])

	function handleAction(input) {
		setCalendarValue(input)
		setDisplayDate(dayjs(input).format('DD/MM/YYYY'))
		buildTimeSlots(input)
		.then((res) => {
			setTimeslotData(res)
		})
	}


	async function buildTimeSlots(data) {


			async function getCurrentWeekdayBusinessHours(day) {

				return new Promise((resolve, reject) => {

					for(let timegroup of timegroupData) {
						if(timegroup.day === day) {
							resolve({
								open: timegroup.open,
								close: timegroup.close
							})
						}
					}

				})

			}

			let currentWeekday = dayjs(data).day()
			let businessHours = await getCurrentWeekdayBusinessHours(currentWeekday)

			let res = await initTimeslots(businessHours.open, businessHours.close, 30)
			return res


	}

	async function initTimeslots(start, end, interval) {

		return new Promise((resolve, reject) => {

			let timeslotArray = [];

			let startTime = dayjs(start, 'HH:mm:ss')
			let endTime = dayjs(end, 'HH:mm:ss')

			let currentStep = startTime
			let diff = dayjs.duration(endTime.diff(startTime))

			while(diff.asMinutes() > 0) {
				timeslotArray.push(currentStep.format('HH:mm:ss'))
				currentStep = currentStep.add(interval, 'minute')
				diff = dayjs.duration(endTime.diff(currentStep))

			}

			resolve((timeslotArray))

		})

	}

	function handleSelect(sTimeslot) {
		setSelectedDate(displayDate)
		setSelectedTime(sTimeslot)
		navigate('/process');
	}

	return (
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh'})}>
		{!!loading && (
			<div>loading...</div>
		)}
		{!loading && (
			<Container style={{ position: 'relative' }} size="xs" px="xs" py="xl">
				<div style={{ position: 'absolute', top: 0, left: 0, marginTop: '1rem', marginLeft: '1rem' }}>
					<ActionIcon color="dark" radius="md" variant="outline" size="xl" onClick={() => {navigate('/')}}>
						<IconArrowNarrowLeft size={34} />
					</ActionIcon>
				</div>
				<Title size="h2" align="center">
					Ginseng Massage
				</Title>
				<Text weight={500} align="center" mb="xl">
					Choose your time
				</Text>
				<Center>
					<Card shadow="sm" p="xl" withBorder>
						<Calendar 
							value={calendarValue} 
							onChange={(calendarValue) => handleAction(calendarValue)}
							minDate={dayjs(new Date()).toDate()}
							allowLevelChange={false}
							firstDayOfWeek="sunday"
							excludeDate={(date) => handleExcludeDays(date)}
						/>
					</Card>
				</Center>
				<Title size="h4" align="center" mt="xl">{displayDate}</Title>
				<Container>
					<Grid mt="md" gutter="xl">
						{timeslotData.map((timeslot, index) => (
							<Grid.Col key={index} span={6}>
								<Button size="md" variant="default" fullWidth onClick={() => handleSelect(timeslot)}>
									{timeslot}
								</Button>
							</Grid.Col>
						))}
					</Grid>
				</Container>
			</Container>
		)}
		</Paper>
	);

}

export default Booking;