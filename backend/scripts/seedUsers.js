const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config();

const departments = ['Finance', 'HR', 'IT', 'Marketing', 'Sales', 'Operations', 'Legal', 'R&D'];

const indianNames = {
  Finance: {
    manager: { name: 'Rajesh Kumar', email: 'rajesh.kumar@company.com' },
    employees: [
      { name: 'Priya Sharma', email: 'priya.sharma@company.com' },
      { name: 'Amit Patel', email: 'amit.patel@company.com' },
      { name: 'Sneha Gupta', email: 'sneha.gupta@company.com' },
      { name: 'Vikram Singh', email: 'vikram.singh@company.com' },
      { name: 'Kavya Reddy', email: 'kavya.reddy@company.com' },
      { name: 'Rohit Jain', email: 'rohit.jain@company.com' }
    ]
  },
  HR: {
    manager: { name: 'Sunita Agarwal', email: 'sunita.agarwal@company.com' },
    employees: [
      { name: 'Arjun Mehta', email: 'arjun.mehta@company.com' },
      { name: 'Deepika Nair', email: 'deepika.nair@company.com' },
      { name: 'Karan Malhotra', email: 'karan.malhotra@company.com' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@company.com' },
      { name: 'Siddharth Rao', email: 'siddharth.rao@company.com' }
    ]
  },
  IT: {
    manager: { name: 'Suresh Krishnan', email: 'suresh.krishnan@company.com' },
    employees: [
      { name: 'Rahul Verma', email: 'rahul.verma@company.com' },
      { name: 'Pooja Bansal', email: 'pooja.bansal@company.com' },
      { name: 'Nikhil Chopra', email: 'nikhil.chopra@company.com' },
      { name: 'Ritu Saxena', email: 'ritu.saxena@company.com' },
      { name: 'Abhishek Tiwari', email: 'abhishek.tiwari@company.com' },
      { name: 'Meera Pillai', email: 'meera.pillai@company.com' },
      { name: 'Gaurav Bhatt', email: 'gaurav.bhatt@company.com' }
    ]
  },
  Marketing: {
    manager: { name: 'Neha Kapoor', email: 'neha.kapoor@company.com' },
    employees: [
      { name: 'Varun Sinha', email: 'varun.sinha@company.com' },
      { name: 'Ishita Joshi', email: 'ishita.joshi@company.com' },
      { name: 'Akash Pandey', email: 'akash.pandey@company.com' },
      { name: 'Shreya Mishra', email: 'shreya.mishra@company.com' },
      { name: 'Manish Agrawal', email: 'manish.agrawal@company.com' },
      { name: 'Divya Kulkarni', email: 'divya.kulkarni@company.com' }
    ]
  },
  Sales: {
    manager: { name: 'Anil Thakur', email: 'anil.thakur@company.com' },
    employees: [
      { name: 'Ravi Dubey', email: 'ravi.dubey@company.com' },
      { name: 'Swati Goyal', email: 'swati.goyal@company.com' },
      { name: 'Harsh Bhatia', email: 'harsh.bhatia@company.com' },
      { name: 'Nisha Arora', email: 'nisha.arora@company.com' },
      { name: 'Vishal Yadav', email: 'vishal.yadav@company.com' }
    ]
  },
  Operations: {
    manager: { name: 'Manoj Desai', email: 'manoj.desai@company.com' },
    employees: [
      { name: 'Sanjay Bhardwaj', email: 'sanjay.bhardwaj@company.com' },
      { name: 'Rekha Sood', email: 'rekha.sood@company.com' },
      { name: 'Ajay Khanna', email: 'ajay.khanna@company.com' },
      { name: 'Pallavi Dutta', email: 'pallavi.dutta@company.com' },
      { name: 'Deepak Mittal', email: 'deepak.mittal@company.com' },
      { name: 'Shilpa Bajaj', email: 'shilpa.bajaj@company.com' }
    ]
  },
  Legal: {
    manager: { name: 'Vinod Chandra', email: 'vinod.chandra@company.com' },
    employees: [
      { name: 'Kavita Sethi', email: 'kavita.sethi@company.com' },
      { name: 'Rajat Goel', email: 'rajat.goel@company.com' },
      { name: 'Smita Ghosh', email: 'smita.ghosh@company.com' },
      { name: 'Ashwin Menon', email: 'ashwin.menon@company.com' },
      { name: 'Preeti Kohli', email: 'preeti.kohli@company.com' }
    ]
  },
  'R&D': {
    manager: { name: 'Dr. Ramesh Subramanian', email: 'ramesh.subramanian@company.com' },
    employees: [
      { name: 'Ankit Shukla', email: 'ankit.shukla@company.com' },
      { name: 'Tanvi Raghavan', email: 'tanvi.raghavan@company.com' },
      { name: 'Sameer Bose', email: 'sameer.bose@company.com' },
      { name: 'Aditi Mukherjee', email: 'aditi.mukherjee@company.com' },
      { name: 'Karthik Venkatesh', email: 'karthik.venkatesh@company.com' },
      { name: 'Ritika Choudhary', email: 'ritika.choudhary@company.com' }
    ]
  }
};

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const company = await Company.findOne();
    if (!company) {
      console.error('No company found. Please create a company first.');
      return;
    }

    console.log(`Seeding users for company: ${company.name}`);

    await User.deleteMany({ company: company._id, role: { $ne: 'Admin' } });
    console.log('Cleared existing users');

    let totalCreated = 0;

    for (const department of departments) {
      const deptData = indianNames[department];
      
      const manager = await User.create({
        name: deptData.manager.name,
        email: deptData.manager.email,
        password: 'password123',
        role: 'Manager',
        department: department,
        company: company._id
      });
      
      console.log(`Created manager: ${manager.name} in ${department}`);
      totalCreated++;

      for (const empData of deptData.employees) {
        const employee = await User.create({
          name: empData.name,
          email: empData.email,
          password: 'password123',
          role: 'Employee',
          department: department,
          company: company._id,
          manager: manager._id
        });
        
        console.log(`Created employee: ${employee.name} in ${department}`);
        totalCreated++;
      }
    }

    console.log(`\nSeeding completed! Created ${totalCreated} users across ${departments.length} departments.`);
    console.log('Default password for all users: password123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedUsers();