/**
 * ============================================
 * COMPREHENSIVE RBAC SYSTEM TEST SUITE
 * ============================================
 * Tests all authentication, authorization, and file management features
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const timestamp = Date.now();

// Test data
let userToken = '';
let adminToken = '';
let userId = '';
let testFileId = '';

// Results tracking
const results = {
    passed: 0,
    failed: 0,
    total: 0,
    tests: []
};

// Helper: Log test results
function logTest(name, passed, message = '') {
    results.total++;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (message) console.log(`   ${message}`);
    
    results.tests.push({ name, passed, message });
    if (passed) results.passed++;
    else results.failed++;
}

// Helper: Make HTTP request
async function request(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {}
        };
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (data) {
            config.data = data;
            config.headers['Content-Type'] = 'application/json';
        }
        
        const response = await axios(config);
        return { status: response.status, data: response.data, error: null };
    } catch (error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data, error: error.response.data };
        }
        return { status: 0, data: null, error: error.message };
    }
}

// ============================================
// TEST SUITE
// ============================================

async function runAllTests() {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 COMPREHENSIVE RBAC SYSTEM TEST SUITE');
    console.log('='.repeat(70) + '\n');

    // ===== SECTION 1: USER REGISTRATION =====
    console.log('📝 SECTION 1: USER REGISTRATION\n');
    
    // Test 1: Register valid user
    const res1 = await request('POST', '/api/auth/register', {
        firstName: 'Test',
        lastName: 'User',
        email: `testuser${timestamp}@test.com`,
        password: 'password123'
    });
    
    if (res1.status === 201 && res1.data.token && res1.data.user && res1.data.user.role === 'user') {
        userToken = res1.data.token;
        userId = res1.data.user.id;
        logTest('Register valid user', true, `User created with role: ${res1.data.user.role}`);
    } else {
        logTest('Register valid user', false, `Status: ${res1.status}, Expected: 201`);
    }
    
    // Test 2: Register with missing fields
    const res2 = await request('POST', '/api/auth/register', {
        firstName: 'Incomplete',
        email: `incomplete${timestamp}@test.com`
    });
    logTest('Register with missing fields (should fail)', res2.status === 400, `Status: ${res2.status}`);
    
    // Test 3: Register with short password
    const res3 = await request('POST', '/api/auth/register', {
        firstName: 'Short',
        lastName: 'Pass',
        email: `short${timestamp}@test.com`,
        password: '1234567'
    });
    logTest('Register with short password (should fail)', res3.status === 400, `Status: ${res3.status}`);
    
    // Test 4: Register duplicate email
    const res4 = await request('POST', '/api/auth/register', {
        firstName: 'Duplicate',
        lastName: 'User',
        email: `testuser${timestamp}@test.com`,
        password: 'password123'
    });
    logTest('Register duplicate email (should fail)', res4.status === 409, `Status: ${res4.status}`);

    // ===== SECTION 2: USER LOGIN =====
    console.log('\n🔐 SECTION 2: USER LOGIN\n');
    
    // Test 5: Login with valid credentials
    const res5 = await request('POST', '/api/auth/login', {
        email: `testuser${timestamp}@test.com`,
        password: 'password123'
    });
    
    if (res5.status === 200 && res5.data.token && res5.data.user.permissions) {
        logTest('Login with valid credentials', true, 
            `Permissions: ${res5.data.user.permissions.join(', ')}`);
    } else {
        logTest('Login with valid credentials', false, `Status: ${res5.status}`);
    }
    
    // Test 6: Login with wrong password
    const res6 = await request('POST', '/api/auth/login', {
        email: `testuser${timestamp}@test.com`,
        password: 'wrongpassword'
    });
    logTest('Login with wrong password (should fail)', res6.status === 401, `Status: ${res6.status}`);
    
    // Test 7: Login with non-existent email
    const res7 = await request('POST', '/api/auth/login', {
        email: 'nonexistent@test.com',
        password: 'password123'
    });
    logTest('Login with non-existent email (should fail)', res7.status === 401, `Status: ${res7.status}`);
    
    // Test 8: Login with missing fields
    const res8 = await request('POST', '/api/auth/login', {
        email: `testuser${timestamp}@test.com`
    });
    logTest('Login with missing password (should fail)', res8.status === 400, `Status: ${res8.status}`);

    // ===== SECTION 3: FILE UPLOAD =====
    console.log('\n📁 SECTION 3: FILE UPLOAD\n');
    
    // Test 9: Upload file with valid token
    const res9 = await request('POST', '/api/files/upload', {
        fileName: 'test-document.pdf',
        fileHash: `hash_${timestamp}_1`
    }, userToken);
    
    if (res9.status === 201 && res9.data.file) {
        testFileId = res9.data.file.id;
        logTest('Upload file with valid token', true, `File ID: ${testFileId}`);
    } else {
        logTest('Upload file with valid token', false, `Status: ${res9.status}`);
    }
    
    // Test 10: Upload without token
    const res10 = await request('POST', '/api/files/upload', {
        fileName: 'unauthorized.pdf',
        fileHash: `hash_${timestamp}_unauth`
    });
    logTest('Upload without token (should fail)', res10.status === 401, `Status: ${res10.status}`);
    
    // Test 11: Upload with missing fields
    const res11 = await request('POST', '/api/files/upload', {
        fileName: 'incomplete.pdf'
    }, userToken);
    logTest('Upload with missing fileHash (should fail)', res11.status === 400, `Status: ${res11.status}`);
    
    // Test 12: Upload duplicate file hash
    const res12 = await request('POST', '/api/files/upload', {
        fileName: 'duplicate.pdf',
        fileHash: `hash_${timestamp}_1`
    }, userToken);
    logTest('Upload duplicate fileHash (should fail)', res12.status === 409, `Status: ${res12.status}`);

    // ===== SECTION 4: FILE MANAGEMENT (USER) =====
    console.log('\n📂 SECTION 4: FILE MANAGEMENT (USER)\n');
    
    // Test 13: Get my files
    const res13 = await request('GET', '/api/files/my-files', null, userToken);
    
    if (res13.status === 200 && Array.isArray(res13.data.files)) {
        logTest('Get my files', true, `Found ${res13.data.count} file(s)`);
    } else {
        logTest('Get my files', false, `Status: ${res13.status}`);
    }
    
    // Test 14: Get files without token
    const res14 = await request('GET', '/api/files/my-files');
    logTest('Get files without token (should fail)', res14.status === 401, `Status: ${res14.status}`);
    
    // Test 15: Delete own file
    const res15 = await request('DELETE', `/api/files/${testFileId}`, null, userToken);
    logTest('Delete own file', res15.status === 200, `Status: ${res15.status}`);
    
    // Test 16: Delete non-existent file
    const res16 = await request('DELETE', '/api/files/999999999999999999999999', null, userToken);
    logTest('Delete non-existent file (should fail)', res16.status === 404, `Status: ${res16.status}`);

    // ===== SECTION 5: AUTHORIZATION (RBAC) =====
    console.log('\n🛡️  SECTION 5: AUTHORIZATION (RBAC)\n');
    
    // Test 17: User tries to access admin endpoint - view users
    const res17 = await request('GET', '/api/admin/users', null, userToken);
    logTest('User access admin/users (should fail)', res17.status === 403, 
        `Status: ${res17.status} - Access correctly denied`);
    
    // Test 18: User tries to access admin endpoint - view all files
    const res18 = await request('GET', '/api/admin/files', null, userToken);
    logTest('User access admin/files (should fail)', res18.status === 403, 
        `Status: ${res18.status} - Access correctly denied`);
    
    // Test 19: Access admin endpoint without token
    const res19 = await request('GET', '/api/admin/users');
    logTest('Access admin endpoint without token (should fail)', res19.status === 401, 
        `Status: ${res19.status}`);

    // ===== SECTION 6: JWT TOKEN VALIDATION =====
    console.log('\n🔑 SECTION 6: JWT TOKEN VALIDATION\n');
    
    // Test 20: Request with invalid token
    const res20 = await request('GET', '/api/files/my-files', null, 'invalid.token.here');
    logTest('Request with invalid token (should fail)', res20.status === 401, `Status: ${res20.status}`);
    
    // Test 21: Request with malformed authorization header
    const res21 = await request('GET', '/api/files/my-files', null, 'NotBearer token');
    logTest('Request with malformed auth header (should fail)', res21.status === 401, `Status: ${res21.status}`);

    // ===== SECTION 7: API ROOT ENDPOINT =====
    console.log('\n🏠 SECTION 7: API ROOT ENDPOINT\n');
    
    // Test 22: Access root endpoint
    const res22 = await request('GET', '/');
    
    if (res22.status === 200 && res22.data.message && res22.data.endpoints) {
        logTest('Access API root endpoint', true, `API version: ${res22.data.version}`);
    } else {
        logTest('Access API root endpoint', false, `Status: ${res22.status}`);
    }

    // ===== SECTION 8: PASSWORD HASHING =====
    console.log('\n🔒 SECTION 8: PASSWORD SECURITY\n');
    
    // Test 23: Register and verify password is hashed
    const res23 = await request('POST', '/api/auth/register', {
        firstName: 'Security',
        lastName: 'Test',
        email: `security${timestamp}@test.com`,
        password: 'testpassword123'
    });
    
    if (res23.status === 201) {
        // Password should not be visible in response
        const hasPassword = res23.data.user && res23.data.user.password;
        logTest('Password not exposed in registration response', !hasPassword, 
            hasPassword ? 'Warning: Password exposed!' : 'Password correctly hidden');
    } else {
        logTest('Password security test', false, 'Registration failed');
    }
    
    // Test 24: Login and verify password is hashed
    const res24 = await request('POST', '/api/auth/login', {
        email: `security${timestamp}@test.com`,
        password: 'testpassword123'
    });
    
    if (res24.status === 200) {
        const hasPassword = res24.data.user && res24.data.user.password;
        logTest('Password not exposed in login response', !hasPassword, 
            hasPassword ? 'Warning: Password exposed!' : 'Password correctly hidden');
    } else {
        logTest('Login password security test', false, 'Login failed');
    }

    // ===== FINAL SUMMARY =====
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70) + '\n');
    
    console.log(`✅ Passed: ${results.passed}/${results.total}`);
    console.log(`❌ Failed: ${results.failed}/${results.total}`);
    console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);
    
    if (results.failed === 0) {
        console.log('🎉 ALL TESTS PASSED! SYSTEM IS FULLY FUNCTIONAL!\n');
    } else {
        console.log('⚠️  Some tests failed. Review errors above.\n');
        console.log('Failed tests:');
        results.tests.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.message}`);
        });
        console.log();
    }
    
    console.log('='.repeat(70));
    
    // Detailed breakdown
    console.log('\n📋 DETAILED BREAKDOWN:\n');
    console.log('Section 1 - Registration: ' + 
        results.tests.slice(0, 4).filter(t => t.passed).length + '/4');
    console.log('Section 2 - Login: ' + 
        results.tests.slice(4, 8).filter(t => t.passed).length + '/4');
    console.log('Section 3 - File Upload: ' + 
        results.tests.slice(8, 12).filter(t => t.passed).length + '/4');
    console.log('Section 4 - File Management: ' + 
        results.tests.slice(12, 16).filter(t => t.passed).length + '/4');
    console.log('Section 5 - Authorization: ' + 
        results.tests.slice(16, 19).filter(t => t.passed).length + '/3');
    console.log('Section 6 - Token Validation: ' + 
        results.tests.slice(19, 21).filter(t => t.passed).length + '/2');
    console.log('Section 7 - API Root: ' + 
        results.tests.slice(21, 22).filter(t => t.passed).length + '/1');
    console.log('Section 8 - Password Security: ' + 
        results.tests.slice(22, 24).filter(t => t.passed).length + '/2');
    
    console.log('\n' + '='.repeat(70) + '\n');
}

// Run all tests
console.log('\n⏳ Waiting for server to be ready...\n');
setTimeout(() => {
    runAllTests().catch(error => {
        console.error('❌ Test suite error:', error.message);
        process.exit(1);
    });
}, 2000);
