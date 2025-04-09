const DoctorsTable = () => {
    const doctors = [
      { id: 1, name: "Sam", mobile: "0785553221", address: "Kalutara", charge: "2500.00", education: "MBBS", dob: "1954-04-13", status: "Online" },
      { id: 2, name: "John", mobile: "0724728839", address: "Kandy", charge: "2500.00", education: "Phd", dob: "1978-05-13", status: "Offline" },
      { id: 3, name: "David", mobile: "0784924839", address: "Galle", charge: "2500.00", education: "MBBS", dob: "1987-04-18", status: "Offline" },
      { id: 4, name: "Christians", mobile: "0784757839", address: "Matara", charge: "2500.00", education: "MBBS", dob: "1969-06-13", status: "Offline" },
    ];
  
    return (
      <div className="doctors-table">
        <h2>Recent Doctors</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>Consultancy Charge</th>
              <th>Education</th>
              <th>DOB</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.id}</td>
                <td>{doctor.name}</td>
                <td>{doctor.mobile}</td>
                <td>{doctor.address}</td>
                <td>{doctor.charge}</td>
                <td>{doctor.education}</td>
                <td>{doctor.dob}</td>
                <td>
                  <span className={`status ${doctor.status.toLowerCase()}`}>
                    {doctor.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default DoctorsTable; 