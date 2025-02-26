
import Link from 'next/link'
import React from 'react'


function page() {
  return (
    <>

      <div className='w-full h-full p-4 gap-3 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-br from-[#8EC5FC] via-[#E0C3FC] to-[#8EC5FC]'>
      {[
          {
            title: 'Plan. Track. Achieve.',
            subtitle: 'Study. Revisions. Success. Simplified',
            cta: 'Ignite Your Productivity',
            button: 'Try Ignify Today!',
            link: '/sign-in',
            reverse: false
          },
          {
            title: 'Task Management',
            subtitle: 'Stay on Top of Your Tasks',
            cta: 'No More Missed Deadlines!',
            reverse: false
          },
          {
            title: 'Automated Reminders',
            subtitle: 'We Take Care of the Reminders',
            cta: 'You Take Care of Achieving Your Goals!',
            reverse: true
          },
          {
            title: 'Revision Scheduler',
            subtitle: 'Never Cram Again',
            cta: 'Perfectly Timed Revisions!',
            reverse: false
          },
          {
            title: 'Analytics & Insights',
            subtitle: 'Track Progress.',
            cta: 'Improve Performance',
            reverse: true
          },
          {
            title: 'Study Planner',
            subtitle: 'Customize Your Study Schedule.',
            cta: 'Maximum Efficiency.',
            reverse: false
          }
        ].map(({ title, subtitle, cta, button, link, reverse }, index) => (
          <div key={index}
            className={`w-full h-[calc(100vh-85px)] sm:h-auto sm:py-10 flex flex-col ${reverse ? 'sm:flex-row-reverse' : 'sm:flex-row'} p-6 sm:p-10 rounded-2xl items-center justify-evenly sm:justify-between gap-6 bg-gradient-to-r from-[#6a11cb] via-[#2575fc] to-[#6a11cb] shadow-lg`}
          >
            <div className='flex flex-col justify-center self-start sm:self-center sm:w-1/2 p-4 gap-4 sm:gap-8 font-serif text-gray-900'>
              <h2 className='text-3xl sm:text-4xl font-bold text-[#ffffff]'>{title}</h2>
              <p className='text-lg sm:text-xl text-[#d1e8ff]'>{subtitle}<span className='block font-semibold text-[#ffeb3b]'>{cta}</span></p>
              {button && link && (
                <Link href={link} className='flex self-start px-6 py-3 rounded-full bg-[#ffeb3b] text-gray-900 shadow-md hover:bg-[#fbc02d] transition'>
                  {button}
                </Link>
              )}
            </div>
            <div className='w-full sm:w-1/2 h-60 sm:h-80 md:h-[30rem] rounded-3xl bg-[#ffffff]'></div>
          </div>
        ))}

        {/* Footer Section */}
        <footer className='w-full bg-[#1a237e] text-white py-6 mt-10 text-center rounded-md'>
          <div className='max-w-6xl mx-auto px-4'>
            <p className='text-lg font-semibold'>Ignify &copy; {new Date().getFullYear()}</p>
            <div className='flex justify-center gap-6 mt-4'>
              <Link href='/about' className='hover:underline text-[#ffeb3b]'>About</Link>
              <Link href='/contact' className='hover:underline text-[#ffeb3b]'>Contact</Link>
              <Link href='/privacy' className='hover:underline text-[#ffeb3b]'>Privacy Policy</Link>
              <Link href='/terms' className='hover:underline text-[#ffeb3b]'>Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>

    </>

  )
}

export default page