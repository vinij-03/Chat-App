import React from 'react'

function avatar({ username }) {
  return (
    <div className='w-8 h-8 flex items-center justify-center rounded-full bg-[#B67352] text-white mr-3'>
      <div className='text-center'>{username[0]}</div>
    </div>

  )
}

export default avatar
