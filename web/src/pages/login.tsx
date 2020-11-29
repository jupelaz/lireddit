import { Box, Button } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/dist/client/router';
import React from 'react';
import Inputfield from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';

const Login: React.FC<{}> = () => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik 
        initialValues={{username: "", password: ""}}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ options: values });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push('/');
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
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Login;