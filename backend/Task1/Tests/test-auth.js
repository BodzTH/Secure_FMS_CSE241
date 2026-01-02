const axios = require('axios');

let passedTests = 0;
let failedTests = 0;
let testEmail = '';

const testRegister = async () => {
    try {
        console.log('🧪 Test 1: User Registration');
        console.log('─────────────────────────────────────────');
        
        testEmail = `test${Date.now()}@example.com`;
        
        const response = await axios.post('http://localhost:3000/api/auth/register', {
            firstName: 'Ahmed',
            lastName: 'Mohamed',
            email: testEmail,
            password: '12345678'
        });
        
        console.log('✅ PASSED: Registration successful');
        console.log('   Status:', response.status);
        console.log('   User ID:', response.data.user.id);
        console.log('   Email:', response.data.user.email);
        console.log('   Token:', response.data.token.substring(0, 30) + '...');
        passedTests++;
        return { token: response.data.token, email: testEmail };
    } catch (error) {
        console.log('❌ FAILED: Registration failed');
        console.log('   Error:', error.response?.data || error.message);
        failedTests++;
        return null;
    }
};

const testLogin = async (email, password) => {
    try {
        console.log('\n🧪 Test 2: User Login');
        console.log('─────────────────────────────────────────');
        
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email,
            password
        });
        
        console.log('✅ PASSED: Login successful');
        console.log('   Status:', response.status);
        console.log('   Email:', response.data.user.email);
        console.log('   Token:', response.data.token.substring(0, 30) + '...');
        passedTests++;
        return response.data.token;
    } catch (error) {
        console.log('❌ FAILED: Login failed');
        console.log('   Error:', error.response?.data || error.message);
        failedTests++;
        return null;
    }
};

const testMissingFields = async () => {
    try {
        console.log('\n🧪 Test 3: Validation - Missing Fields');
        console.log('─────────────────────────────────────────');
        
        await axios.post('http://localhost:3000/api/auth/register', {
            firstName: 'Test'
        });
        
        console.log('❌ FAILED: Should have rejected missing fields');
        failedTests++;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ PASSED: Correctly rejected missing fields');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error);
            passedTests++;
        } else {
            console.log('❌ FAILED: Wrong error response');
            console.log('   Error:', error.response?.data || error.message);
            failedTests++;
        }
    }
};

const testShortPassword = async () => {
    try {
        console.log('\n🧪 Test 4: Validation - Short Password');
        console.log('─────────────────────────────────────────');
        
        await axios.post('http://localhost:3000/api/auth/register', {
            firstName: 'Test',
            lastName: 'User',
            email: 'short@test.com',
            password: '123'
        });
        
        console.log('❌ FAILED: Should have rejected short password');
        failedTests++;
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('8 characters')) {
            console.log('✅ PASSED: Correctly rejected short password');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error);
            passedTests++;
        } else {
            console.log('❌ FAILED: Wrong error response');
            console.log('   Error:', error.response?.data || error.message);
            failedTests++;
        }
    }
};

const testInvalidEmail = async () => {
    try {
        console.log('\n🧪 Test 5: Validation - Invalid Email Format');
        console.log('─────────────────────────────────────────');
        
        await axios.post('http://localhost:3000/api/auth/register', {
            firstName: 'Test',
            lastName: 'User',
            email: 'notanemail',
            password: '12345678'
        });
        
        console.log('❌ FAILED: Should have rejected invalid email');
        failedTests++;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ PASSED: Correctly rejected invalid email');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error || error.response.data.details);
            passedTests++;
        } else {
            console.log('❌ FAILED: Wrong error response');
            console.log('   Error:', error.response?.data || error.message);
            failedTests++;
        }
    }
};

const testDuplicateEmail = async (email) => {
    try {
        console.log('\n🧪 Test 6: Validation - Duplicate Email');
        console.log('─────────────────────────────────────────');
        
        await axios.post('http://localhost:3000/api/auth/register', {
            firstName: 'Duplicate',
            lastName: 'User',
            email: email,
            password: '12345678'
        });
        
        console.log('❌ FAILED: Should have rejected duplicate email');
        failedTests++;
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('✅ PASSED: Correctly rejected duplicate email');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error);
            passedTests++;
        } else {
            console.log('❌ FAILED: Wrong error response');
            console.log('   Error:', error.response?.data || error.message);
            failedTests++;
        }
    }
};

const testWrongPassword = async (email) => {
    try {
        console.log('\n🧪 Test 7: Login - Wrong Password');
        console.log('─────────────────────────────────────────');
        
        await axios.post('http://localhost:3000/api/auth/login', {
            email: email,
            password: 'wrongpassword'
        });
        
        console.log('❌ FAILED: Should have rejected wrong password');
        failedTests++;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ PASSED: Correctly rejected wrong password');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error);
            passedTests++;
        } else {
            console.log('❌ FAILED: Wrong error response');
            console.log('   Error:', error.response?.data || error.message);
            failedTests++;
        }
    }
};

const testNonExistentUser = async () => {
    try {
        console.log('\n🧪 Test 8: Login - Non-existent User');
        console.log('─────────────────────────────────────────');
        
        await axios.post('http://localhost:3000/api/auth/login', {
            email: 'nonexistent@example.com',
            password: '12345678'
        });
        
        console.log('❌ FAILED: Should have rejected non-existent user');
        failedTests++;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ PASSED: Correctly rejected non-existent user');
            console.log('   Status:', error.response.status);
            console.log('   Error:', error.response.data.error);
            passedTests++;
        } else {
            console.log('❌ FAILED: Wrong error response');
            console.log('   Error:', error.response?.data || error.message);
            failedTests++;
        }
    }
};

const runTests = async () => {
    console.log('\n');
    console.log('═════════════════════════════════════════');
    console.log('🚀 AUTHENTICATION SYSTEM - FULL TEST SUITE');
    console.log('═════════════════════════════════════════\n');
    
    // Test 1: Registration
    const result = await testRegister();
    
    if (result) {
        // Test 2: Login
        await testLogin(result.email, '12345678');
        
        // Test 6: Duplicate email
        await testDuplicateEmail(result.email);
        
        // Test 7: Wrong password
        await testWrongPassword(result.email);
    }
    
    // Test 3: Missing fields
    await testMissingFields();
    
    // Test 4: Short password
    await testShortPassword();
    
    // Test 5: Invalid email
    await testInvalidEmail();
    
    // Test 8: Non-existent user
    await testNonExistentUser();
    
    // Summary
    console.log('\n═════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═════════════════════════════════════════');
    console.log(`✅ Passed: ${passedTests}/8`);
    console.log(`❌ Failed: ${failedTests}/8`);
    console.log(`📈 Success Rate: ${Math.round((passedTests / 8) * 100)}%`);
    console.log('═════════════════════════════════════════\n');
    
    if (failedTests === 0) {
        console.log('🎉 ALL TESTS PASSED! System is working perfectly!\n');
    } else {
        console.log('⚠️  Some tests failed. Please check the errors above.\n');
    }
};

runTests().catch(err => {
    console.error('\n💥 Fatal Error:', err.message);
    process.exit(1);
});
