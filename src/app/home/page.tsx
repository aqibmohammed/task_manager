import React from 'react'
import TaskList from '../_components/tasklist'
import LogoutButton from '../_components/logout'

const page = () => {

  
  return (


    <div className='min-h-screen'>
    <div className='p-5'>
      <LogoutButton/>
    </div>

<div className=" flex relative items-center justify-center">
      <TaskList/>
    </div>

    </div>

  )
}

export default page