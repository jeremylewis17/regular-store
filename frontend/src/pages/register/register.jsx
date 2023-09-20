import React, { useContext, useRef, useState } from "react";
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { AuthContext } from "../../context/auth-context";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "./register.css";


export const Register = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const { registerUser } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Error: Passwords must match');
        }
        try {
            setError('');
            setLoading(true);
            await registerUser(emailRef.current.value, passwordRef.current.value);
            navigate("/login");
        } catch {
            setError('Failed to create an account');
        }

        setLoading(false);
    }

    return (
        <div className="Register-Page">
            <Card>
                <Card.Body>
                    <h2 className="Sign-Up-Header">Sign Up</h2>
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
                        <Form.Group id="password-confirm">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef} required />
                        </Form.Group>
                        <Button disabled={loading} className="submit-button" type="submit">
                            Sign Up
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
            <div className="Login-button">
                Already have an account? <Link to="/login">Log In</Link>
            </div>
        
        </div>
    );
};