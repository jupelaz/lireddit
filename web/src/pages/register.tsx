import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React from 'react'
import Inputfield from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';

interface registerProps {}


const Register: React.FC<registerProps> = () => {
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            //worked
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Inputfield name='username' label='Username'/>
            <Box mt={4}>
              <Inputfield name='password' label='Password' type='password'/>
            </Box>
            <Button
              mt={4}
              colorScheme='teal'
              type='submit'
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;