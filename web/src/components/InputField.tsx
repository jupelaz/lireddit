import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/core';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
}; //
const Inputfield: React.FC<InputFieldProps> = ({
  label, 
  size: _,
  ...props
}) => {
  const [field, {error}] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
    <FormLabel htmlFor={field.name}>{label}</FormLabel>
    <Input 
      {...field}
      {...props}
      id={field.name} 
      placeholder={props.placeholder?props.placeholder:field.name} 
    />
    {error ? <FormErrorMessage>{ error }</FormErrorMessage> : null}
  </FormControl>
)}

export default Inputfield;