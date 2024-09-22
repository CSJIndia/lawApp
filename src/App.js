import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { read, utils } from 'xlsx';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.png';
import Parivartan from './image.png';

function App() {
  const [lawName, setLawName] = useState('');
  const [sectionNo, setSectionNo] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [lawNames, setLawNames] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);

  useEffect(() => {
    fetch('./test.xlsx')
      .then((response) => response.arrayBuffer())
      .then((data) => {
        const workbook = read(data, { type: 'array' });

        let allData = [];
        let allLawNames = [];
        let allSections = new Set(); // Using Set to keep sections unique

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(sheet, { header: 1, blankrows:false });
          console.log("json data:", jsonData);

          allData = [
            ...allData,
            ...jsonData.slice(1).map((row) => {
              allSections.add(row[0]); // Add section number to the Set
              return {
                lawName: sheetName,
                sectionNoInput: row[0],       // Section No (old)
                textOfOldLaw: row[1],         // Text of old law
                sectionNoOutput: row[2],      // Section No (new)
                textOfNewLaw: row[3]         // Text of new law
              };
            }),
          ];

          allLawNames.push(sheetName);
        });

        setData(allData);
        setFilteredData(allData); // Initialize filteredData with all data
        setLawNames(allLawNames); // Set law names for dropdown options

        // Prepare options for react-select
        const sectionOptions = Array.from(allSections).map((section) => ({
          value: section,
          label: section,
        }));
        setSectionOptions(sectionOptions);
      });
  }, []);

  const handleFilter = () => {
    console.log("Selected Law Name:", lawName); // Debugging
    console.log("Selected Section No:", sectionNo); // Debugging
  
    const filtered = data.filter((item) => {
      const lawNameMatch = lawName ? item.lawName.includes(lawName) : true;
  
      // Ensure item.sectionNoInput and sectionNo are both defined before trying to match
      const sectionNoMatch = sectionNo 
        ? item.sectionNoInput && item.sectionNoInput.toString() === sectionNo.value.toString()
        : true;
  
      console.log("Law Name Match:", lawNameMatch); // Debugging
      console.log("Section No Match:", sectionNoMatch); // Debugging
  
      return lawNameMatch && sectionNoMatch;
    });
  
    console.log("Filtered Data:", filtered); // Debugging
    setFilteredData(filtered);
  };
  
  const handleLawNameChange = (e) => {
    const selectedLawName = e.target.value;
    setLawName(selectedLawName);
    const filtered = data.filter((item) => item.lawName === selectedLawName);
    setFilteredData(filtered);
  };

  const handleSectionChange = (selectedOption) => {
    setSectionNo(selectedOption);
  };

  const styles = {
    footer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100px',
      backgroundColor: '#f1f1f1',
      position: 'fixed',
      bottom: 0,
      width: '100%',
    },
    logo: {
      height: '50px',
    },
  };

  return (
    <div className="App container mt-4">
      <header className="d-flex justify-content-center align-items-center mb-4">
        <img src={Parivartan} alt="Header" style={{ width: '30%', height: '30%' }} />
        <nav style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <a href="/About.html" className="about-us-link">About Us</a> {/* Link to external About Us page */}
          <a href="/howToUse.html" className="about-us-link">How to use</a> 
          <a href="/howToUse.html" className="about-us-link">Contact Us</a> 
        </nav>
      </header>
      <div className="mb-4">
        <div className="form-group">
          <label>Law Name:</label>
          <select
            value={lawName}
            className="form-control"
            onChange={handleLawNameChange}
          >
            <option value="">Select Law Name</option>
            {lawNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Section No (input):</label>
          <Select
            value={sectionNo}
            onChange={handleSectionChange}
            options={sectionOptions}
            isClearable
            placeholder="Select Section No"
          />
        </div>
        <button className="btn btn-primary mt-2" onClick={handleFilter}>
          Filter
        </button>
      </div>
      <table className="table table-bordered">
        <thead className="thead-light">
          <tr>
            <th>पुरानी धारा नंबर</th>
            <th>नयी धारा नंबर</th>
            <th>नया कानून</th>
            <th>बदलावों का विवरण</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>{row.sectionNoInput}</td>
              <td dangerouslySetInnerHTML={{ __html: row.textOfOldLaw }}></td>
              <td dangerouslySetInnerHTML={{ __html: row.sectionNoOutput }}></td>
              <td dangerouslySetInnerHTML={{ __html: row.textOfNewLaw }}></td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer style={styles.footer}>
        <img src={logo} alt="Logo" style={styles.logo} />
        App created by Centre for Social Justice
      </footer>
    </div>
  );
}

export default App;
