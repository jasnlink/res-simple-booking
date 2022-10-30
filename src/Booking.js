import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import Axios from 'axios';

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
	LoadingOverlay
 } from '@mantine/core';

import { IconArrowNarrowLeft } from '@tabler/icons';
import { Calendar } from '@mantine/dates';

function Booking({ selectedServiceId, setSelectedDate, setSelectedTime }) {

	dayjs.extend(utc)
	dayjs.extend(duration)
	dayjs.extend(customParseFormat)
	let navigate = useNavigate();

	const [loading, setLoading] = useState(true)
	const [timeslotLoading, setTimeslotLoading] = useState(false)

	const [currentDateTime, setCurrentDateTime] = useState(dayjs());
	const [timegroupData, setTimegroupData] = useState([]);

	const [calendarValue, setCalendarValue] = useState(null);
	const [closedBusinessDays, setClosedBusinessDays] = useState(null);
	const [displayDate, setDisplayDate] = useState('')
	const [displayMessage, setDisplayMessage] = useState('');
	const [timeslotData, setTimeslotData] = useState([])

	// handles determining which days are closed from the received timegroup data
	async function getClosedBusinessDays(timegroupData) {

		return new Promise((resolve, reject) => {

			let res = []

			for(let timegroup of timegroupData) {
				if(timegroup.is_closed === 1) {
					res.push(timegroup.day)
				}
			}
			resolve(setClosedBusinessDays(res))

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

		if(!selectedServiceId) {
			navigate('/')
		}

		const request = process.env.REACT_APP_BACKEND_ROUTE+'/api/list/timegroups'
		Axios.post(request)
		.then((response) => {

			setTimegroupData(response.data)

			getClosedBusinessDays(response.data)
			.then(() => {
				setLoading(false)
			})
		})


	}, [])

	function handleAction(input) {

		function convertToLocalTime(data) {
			return new Promise((resolve, reject) => {
				if(!data.length) {
					resolve([])
				}
				for(let i = 0; i < data.length; i++) {
					let row = data[i]
					let dayjsRowDateTime = dayjs.utc(row.reserved_date+'-'+row.reserved_time, 'YYYY-MM-DD-HH:mm:ss')

					row.reserved_date = dayjsRowDateTime.local().format('YYYY-MM-DD')
					row.reserved_time = dayjsRowDateTime.local().format('HH:mm:ss')

					if(i === data.length-1) {
						resolve(data)
					}
				}
			})
		}

		let parsedDate = dayjs(input).format('YYYY-MM-DD')
		if(displayDate !== parsedDate) {

			setTimeslotLoading(true)
	
			Axios.post(process.env.REACT_APP_BACKEND_ROUTE+'/api/list/limit/date/bookings', {
				limitDate: parsedDate
			})
			.then((res) => {

				setCalendarValue(input)
				setDisplayDate(parsedDate)
	
				convertToLocalTime(res.data)
				.then((localBookedTimes) => {

					buildTimeSlots(input, localBookedTimes)
					.then((timeslots) => {
						if(!timeslots.length) {
							setDisplayMessage('Fully Booked')
						} else {
							setDisplayMessage('')
						}
						setTimeslotData(timeslots)
						setTimeslotLoading(false)
					})
				})

			})
			.catch((err) => {
				console.error(err)
			})
		}

	}


	async function buildTimeSlots(data, excludeData) {

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

		function roundToNextInterval(intervalMins) {

			let tempCurrentDateTime = currentDateTime

			let mins = tempCurrentDateTime.minute()
			let rounded = Math.ceil(mins/intervalMins)*intervalMins

			if(rounded >= 60) {
				tempCurrentDateTime = tempCurrentDateTime.add(1, 'hours')
				tempCurrentDateTime = tempCurrentDateTime.minute(rounded-60)
			} else {
				tempCurrentDateTime = tempCurrentDateTime.minute(rounded)
			}

			tempCurrentDateTime = tempCurrentDateTime.second(0)

			return tempCurrentDateTime
		}

		let res

		let currentWeekday = dayjs(data).day()
		let businessHours = await getCurrentWeekdayBusinessHours(currentWeekday)
		if(dayjs(data).format('YYYY-MM-DD') === currentDateTime.format('YYYY-MM-DD')) {

			let dayjsbusinessHoursOpen = dayjs(dayjs(data).format('YYYY-MM-DD')+'-'+businessHours.open, 'YYYY-MM-DD-HH:mm:ss')

			if(currentDateTime.diff(dayjsbusinessHoursOpen) >= 0) {
				let currentRoundedTime = roundToNextInterval(30)
				res = await initTimeslots(currentRoundedTime, businessHours.close, 30, excludeData)
			} else {
				res = await initTimeslots(businessHours.open, businessHours.close, 30, excludeData)
			}

		} else {

			res = await initTimeslots(businessHours.open, businessHours.close, 30, excludeData)
		}
		
		return res

	}

	async function initTimeslots(start, end, interval, excludeData) {

		return new Promise((resolve, reject) => {

			let excludeTimeMap = new Map();
			if(excludeData.length) {
				for(let data of excludeData) {
					excludeTimeMap.set(data.reserved_time, true)
				}
			}

			let timeslotArray = [];

			let startTime = dayjs(start, 'HH:mm:ss')
			let endTime = dayjs(end, 'HH:mm:ss')

			let currentStep = startTime
			let diff = dayjs.duration(endTime.diff(startTime))

			while(diff.asMinutes() > 0) {
				let verify = currentStep.format('HH:mm:ss')
				if(excludeTimeMap.has(verify) === false) {
					timeslotArray.push(currentStep.format('HH:mm'))
				}
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
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh', position: 'relative'})}>
		{!!loading && (
			<LoadingOverlay visible={loading} overlayBlur={2} />
		)}
		{!loading && (
			<Container style={{ position: 'relative' }} size="xs" px="xs" py="xl">
				<div style={{ position: 'absolute', top: '1.25rem', left: '1rem' }}>
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
							size="md"
						/>
					</Card>
				</Center>
				<Title size="h4" align="center" mt="xl">{displayDate}</Title>
				<Container style={{ position: 'relative', minHeight: '200px' }}>
					<LoadingOverlay visible={timeslotLoading} overlayBlur={2} />
					<Grid mt="md" gutter="xl">
						{!!timeslotData.length && (
							<>
								{timeslotData.map((timeslot, index) => (
									<Grid.Col key={index} span={6}>
										<Button size="md" variant="default" fullWidth onClick={() => handleSelect(timeslot)}>
											{timeslot}
										</Button>
									</Grid.Col>
								))}
							</>
						)}
						{!timeslotData.length && (
							<Title size="h2" align="center" mt="xl">{displayMessage}</Title>
						)}
					</Grid>
				</Container>
			</Container>
		)}
		</Paper>
	);

}

export default Booking;