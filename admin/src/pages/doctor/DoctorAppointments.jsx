import { useContext } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { useEffect } from 'react';

const DoctorAppointments = () => {

  const {dToken, appointments, getAppointments} = useContext(DoctorContext);

  useEffect(()=> {
    getAppointments();
  }, [dToken]);

  return (
    <div>
      DoctorAppointments
    </div>
  )
}

export default DoctorAppointments
