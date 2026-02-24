"use client";
import { getDoctors } from '@/app/(commonLayout)/consultation/_actions'
import { useQuery } from '@tanstack/react-query'
import React, { use } from 'react'

const DoctorsList = () => {

  const { data} = useQuery({
    queryKey: ['doctors'],
    queryFn: () => getDoctors(),
  })
console.log(data)
//   const {data: nonPrefetchedData} = useQuery({
//     queryKey: ['doctors-non-prefetched'],
//     queryFn: () => getDoctors(),
//   })

//   console.log(nonPrefetchedData)
  return (
    <div>{data?.data?.map((doctor: any) => (
        <div key={doctor.id}>{doctor.name}</div>
    ))}</div>
  )
}

export default DoctorsList