import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React from 'react'
import { useMutation } from 'urql';
import Inputfield from '../components/InputField';
import Wrapper from '../components/Wrapper';

interface registerProps {}

const REGISTER_MUT = `
  mutation Register($username: String!, $password:String!){
    register(options: { username: $username, password: $password}){
      user{
        id
        username
      }
      errors{
        field
        message
      }
    }
  }
  
  `
const Register: React.FC<registerProps> = () => {
  const [, register] = useMutation(REGISTER_MUT);
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async (values) => {
          const response = await register(values)
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