import { useState } from 'react';
import dayjs from 'dayjs';

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
 } from '@mantine/core';

 import { Calendar } from '@mantine/dates';

function Booking({ setStep }) {

	let data = [
		{
			timegroup_id: 0,
			day: 0,
			open: '9:00:00',
			close: '17:00:00'
		},
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
		{
			timegroup_id: 6,
			day: 6,
			open: '9:00:00',
			close: '17:00:00'
		},
	]

	const [value, setValue] = useState(null);

	function handleAction(input) {
			setValue(input)
			console.log(dayjs(input).day())
			setCurrentWeekday(dayjs(input).day())
	}


	async function buildTimeSlots(data) {

		

	}

	//function to build time slots depending on the different open and closing timegroups
	//using getTimeSlots() helper function
	async function buildTimeSlots(data) {


		//a set so we only have unique values
		//need uniques because the timegroups from and to times may overlap each other
		let timeSlotSet = new Set;
		let currentRoundedTime = getCurrentRoundedTime(1)


		var result

		//loop through timegroups
		for(let hours of data) {
			//check if the current time is after opening hours
			//if it is then we generate starting from current time
			//this only applies if the selected day is today
			if (currentRoundedTime > hours.timegroup_from && currentWeekdayRef.current === selectWeekdayRef.current){
				//if current time is after closing hours, then we skip generation because the store is closed
				if (currentRoundedTime > hours.timegroup_to){
					continue;
				} else {
					result = await getTimeSlots(15, currentRoundedTime, hours.timegroup_to)
				}
				
			} else {
				//current time is before opening hours, so we generate the full list starting from opening hours
				result = await getTimeSlots(15, hours.timegroup_from, hours.timegroup_to)
			}
			for(let slot of result) {
				//add the set back into an array
				timeSlotSet.add(slot)
			}
		}
		let timeSlotArray = Array.from(timeSlotSet).sort();
		return timeSlotArray;
	}


	//helper function to generate time slots for a given slot interval, start and end times
	async function getTimeSlots(interval, start, end) {
		
		//store results
		let timeArray = []
		//format start and end times
		let startDateTime = DateTime.fromFormat(start, 'HH:mm:ss');
		let endDateTime = DateTime.fromFormat(end, 'HH:mm:ss');
		//create interval object to step through
		let intervalDateTime = Interval.fromDateTimes(startDateTime, endDateTime)

		
		//helper stepper function to generate an iterator object for an array of time slots
		//given an interval object and an slot interval gap
		function* stepper(interval, intGap) {
			//current selected property at start of the current hour
			let cursor = interval.start;

			//check if we end at 24:00, then we skip the last slot
			//loop to the end
			if(end === '24:00:00') {
				while (cursor < interval.end) {
					//pause execution and return current time
					yield cursor;
					//add 1 step of interval gap
					cursor = cursor.plus({ minutes: intGap });
				}
			} else {
				while (cursor <= interval.end) {
					//pause execution and return current time
					yield cursor;
					//add 1 step of interval gap
					cursor = cursor.plus({ minutes: intGap });
				}
			}
			
		}

		//populate result array with intervals
		for(var step of stepper(intervalDateTime, 15)) {
			timeArray.push(step.toFormat('HH:mm'))
		}

		return timeArray;
	}


	//current day of the week
	let [currentWeekday, setCurrentWeekday] = useState(0);  
	//selected day of the week
	let [selectWeekday, setSelectWeekday] = useState(0);

	//selected date
	let [selectDate, setSelectDate] = useState('');
	//dates selecton list
	let [dates, setDates] = useState('');

	//selected pickup/delivery time
	let [selectTime, setSelectTime] = useState('');
	//pickup/delivery time selection list
	let [time, setTime] = useState('');


	return (
		<Paper p="0" m="0" sx={(theme) => ({backgroundColor: theme.colors.gray[0], minHeight: '100vh'})}>
			<Container size="xs" px="xs" py="xl">
				<Title size="h2" align="center">
					Ginseng Massage
				</Title>
				<Text weight={500} align="center" mb="xl">
					Choose your time
				</Text>
				<Center>
					<Card shadow="sm" p="xl" withBorder>
						<Calendar 
							value={value} 
							onChange={(value) => handleAction(value)}
							minDate={dayjs(new Date()).toDate()}
							allowLevelChange={false}
						/>
						<Button fullWidth onClick={() => {console.log(value)}}>
							Select
						</Button>
					</Card>
				</Center>
			</Container>
		</Paper>
	);

}

export default Booking;