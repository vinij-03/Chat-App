// import React from 'react'

function avatar( {username}) {
  return (
    <div className='w-8 m-2 h-8 bg-gray-200 rounded-full  flex items-center'>
      <div className='text-center w-full'>{username[0]}</div>
    </div>

  )
}

export default avatar