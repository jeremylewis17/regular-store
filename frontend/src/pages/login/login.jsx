import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { AuthContext } from "../../context/auth-context";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const { currentUser, loginUser } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        try {
            await loginUser(emailRef.current.value, passwordRef.current.value);
            console.log('currentUser after login:', currentUser);
            // Check if currentUser is updated
            if (currentUser) {
                console.log('Navigating to "/"');
                navigate("/");
            } else {
                setError('Login failed. Check your credentials.');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setError('Failed to login');
        }
    
        setLoading(false);
    }
    
    

    return (
        <>
            <Card>
                <Card.Body>
                    <h2 className="Sign-Up-Header">Log In</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required />
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required />
                        </Form.Group>
                        <Button disabled={loading} className="submit-button" type="submit">
                            Log In
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className="Login-button">
                Don't have an account? <Link to="/register">Sign Up Here</Link>
            </div>
        </>
    );
};
