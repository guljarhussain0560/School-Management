const testRegistration = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'TestPass123!',
        schoolName: 'Test School',
        schoolRegNo: 'TEST-001',
        phone: '+1234567890',
        entityType: 'school'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

testRegistration();
