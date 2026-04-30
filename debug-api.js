import axios from 'axios';

async function debugAPI() {
  try {
    // 1. Login as uday
    console.log("Attempting login...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'uday@gmail.com',
      password: 'password123' // I assume this is the password since I set it earlier or they used a common one
    });
    
    const token = loginRes.data.token;
    const userId = loginRes.data.id;
    console.log("Login success. User ID:", userId);

    // 2. Get projects
    console.log("Fetching projects...");
    const projectsRes = await axios.get('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const projects = projectsRes.data;
    console.log("Projects found:", projects.length);
    
    if (projects.length > 0) {
      const projectId = projects[0]._id;
      console.log(`Fetching members for project: ${projects[0].name} (${projectId})...`);
      
      const membersRes = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("PROJECT MEMBERS RESPONSE:", JSON.stringify(membersRes.data, null, 2));
    }
    
  } catch (err) {
    console.error("DEBUG ERROR:", err.response?.data || err.message);
  }
}

debugAPI();
