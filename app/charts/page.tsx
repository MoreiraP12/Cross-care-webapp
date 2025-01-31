// @ts-nocheck
'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Card,
  Tab,
  TabList,
  TabGroup,
  Select,
  SelectItem,
  BarChart,
  Title,
  Subtitle,
  Button,
  MultiSelect,
  MultiSelectItem,
  Switch,
  LineChart
} from '@tremor/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const DataCategories = {
  TotalCounts: 'total',
  GenderCounts: 'gender',
  RacialCounts: 'racial',
  DrugCounts: 'drug', // need to think about this as many to many
  TimeCounts: 'time'
};

const WindowOptions = {
  // Total: 'total',
  Window10: 'window_10',
  Window50: 'window_50',
  Window100: 'window_100',
  Window250: 'window_250'
};

const DataSourceOptions = {
  Arxiv: 'arxiv',
  Github: 'github',
  Wikipedia: 'wikipedia', // Change the URL to your custom data source endpoint
  StackExchange: 'stackexchange',
  Pile: 'pile'
};

const ChartPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(
    DataCategories.GenderCounts
  );
  const [sortKey, setSortKey] = useState('disease');
  const [sortOrder, setSortOrder] = useState('asc');
  const [dataToShow, setDataToShow] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(WindowOptions.Window250);
  const [dataSource, setDataSource] = useState(DataSourceOptions.Arxiv); // State for selected data source
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [diseaseNames, setDiseaseNames] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [runTour, setRunTour] = useState(false); // State to control the visibility of the tour
  const [steps, setSteps] = useState<Step[]>([
    {
      target: 'body',
      content: 'Use these tabs to switch between different data categories.',
      placement: 'center'
    },
    {
      target: '.multi-select',
      content: 'Select one or more diseases to filter the chart data.',
      placement: 'bottom'
    },
    {
      target: '.bar-chart',
      content: 'View the distribution of data across selected diseases.',
      placement: 'top'
    }
    // Add more steps as needed
  ]);

  const sortKeys = {
    [DataCategories.TotalCounts]: ['disease', '0'],
    [DataCategories.GenderCounts]: ['disease', 'male', 'female'],
    [DataCategories.RacialCounts]: [
      'disease',
      'white/caucasian',
      'black/african american',
      'asian',
      'hispanic/latino',
      'pacific islander',
      'native american/indigenous'
    ]
  };

  const totalDisplayNames = {
    Disease: 'disease',
    Count: '0'
  };
  const genderDisplayNames = {
    Male: 'male',
    Female: 'female'
  };

  const racialDisplayNames = {
    'White/Caucasian': 'white/caucasian',
    'Black/African American': 'black/african american',
    Asian: 'asian',
    'Hispanic/Latino': 'hispanic/latino',
    'Pacific Islander': 'pacific islander',
    'Native American/Indigenous': 'native american/indigenous'
  };

  const initialDiseaseList = [
    ' mi ',
    'arthritis',
    'asthma',
    'bronchitis',
    'cardiovascular disease',
    'chronic kidney disease',
    'coronary artery disease',
    'covid-19',
    'deafness',
    'diabetes',
    'hypertension',
    'liver failure',
    'mental illness',
    'perforated ulcer',
    'visual anomalies'
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // or any other number

  const fetchDiseaseNames = async () => {
    try {
      const response = await fetch(
        `https://cryptic-forest-27973-570a247a72c1.herokuapp.com/get-disease-names?dataSource=${dataSource}`
      );
      if (response.ok) {
        const names = await response.json();
        setDiseaseNames(names);

        // Set initialDiseases to the diseases from initialDiseaseList that are present in the fetched names
        const initialDiseases = initialDiseaseList.filter((disease) =>
          names.includes(disease)
        );
        setSelectedDiseases(initialDiseases);
      } else {
        console.error('Server error:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  useEffect(() => {
    fetchDiseaseNames();
  }, []); // Empty dependency array to run only on component mount

  // Function to fetch sorted data from the server
  const fetchChartData = async () => {
    console.log(dataSource);
    console.log(dataSource);
    const selectedDiseasesString = selectedDiseases.join(',');
    try {
      const response = await fetch(
        `https://cryptic-forest-27973-570a247a72c1.herokuapp.com/get-chart-data?category=${selectedCategory}&selectedWindow=${selectedWindow}&sortKey=${sortKey}&sortOrder=${sortOrder}&page=${currentPage}&per_page=${pageSize}&selectedDiseases=${selectedDiseasesString}&dataSource=${dataSource}`
      );
      if (response.ok) {
        const fetchedData = await response.json();
        setDataToShow(fetchedData); // Set transformed data
      } else {
        console.error('Server error:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Fetch data when sortKey, sortOrder, selectedCategory, or selectedWindow changes
  useEffect(() => {
    fetchChartData();
  }, [
    selectedCategory,
    selectedWindow,
    dataSource,
    sortKey,
    sortOrder,
    currentPage,
    selectedDiseases
  ]);

  const [additionalChartData, setAdditionalChartData] = useState([]);

  const transformData = (data) => {
    const groupedByDisease = {};

    data.forEach((item) => {
      const { count, demographic, disease } = item;

      if (!groupedByDisease[disease]) {
        groupedByDisease[disease] = { disease: disease };
      }

      // Initialize the demographic count if it does not exist
      if (!groupedByDisease[disease][demographic]) {
        groupedByDisease[disease][demographic] = 0;
      }

      // Sum the counts for each demographic
      groupedByDisease[disease][demographic] = count;
    });

    // Convert the groupedByDisease object into an array of objects
    return Object.values(groupedByDisease);
  };

  const fetchAdditionalChartData = async () => {
    if (!dataToShow.length) return; // Ensure there's data in the first graph

    const diseasesInFirstGraph = dataToShow
      .map((item) => item.disease)
      .join(',');

    try {
      const response = await fetch(
        `https://cryptic-forest-27973-570a247a72c1.herokuapp.com/get-prevalence?category=${selectedCategory}&selectedDiseases=${diseasesInFirstGraph}`
      );
      if (response.ok) {
        const fetchedData = await response.json();
        const transformedData = transformData(fetchedData);
        setAdditionalChartData(transformedData);
      } else {
        console.error('Server error:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Make sure to call this function whenever dataToShow changes
  useEffect(() => {
    fetchAdditionalChartData();
  }, [dataToShow]); // Now depends on dataToShow to re-fetch whenever it changes

  const getSortedAdditionalChartData = () => {
    if (!dataToShow.length) return additionalChartData; // Return original if no reference order

    // Create a map for quick lookup of order
    const orderMap = new Map(
      dataToShow.map((item, index) => [item.disease, index])
    );

    // Sort additional data based on the first graph's disease order
    return additionalChartData.slice().sort((a, b) => {
      return (orderMap.get(a.disease) || 0) - (orderMap.get(b.disease) || 0);
    });
  };

  // Determine display names based on selected category
  let displayNames = {};
  if (selectedCategory === DataCategories.TotalCounts) {
    displayNames = totalDisplayNames;
  } else if (selectedCategory === DataCategories.GenderCounts) {
    displayNames = genderDisplayNames;
  } else if (selectedCategory === DataCategories.RacialCounts) {
    displayNames = racialDisplayNames;
  }

  const downloadJsonData = (dataSource) => {
    let dataToDownload;

    if (dataSource === 'chartData') {
      dataToDownload = dataToShow;
    } else if (dataSource === 'additionalChartData') {
      dataToDownload = additionalChartData;
    } else {
      console.error('Invalid dataSource:', dataSource);
      return;
    }

    // Create a JSON string from the selected data
    const jsonData = JSON.stringify(dataToDownload);

    // Create a Blob object containing the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link element
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);

    // Determine the filename based on the dataSource
    const filename =
      dataSource === 'chartData'
        ? 'chart_data.json'
        : 'additional_chart_data.json';
    a.download = filename;

    // Trigger a click event to initiate the download
    a.click();
  };

  useEffect(() => {
    // Only run the tour if the 'tourShown' flag is not set in localStorage
    const tourShown = localStorage.getItem('tourShown');
    if (!tourShown) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false); // Hide the tour once it's finished or skipped
      localStorage.setItem('tourShown', 'true'); // Set a flag in localStorage
    }
  };

  // Render sort key dropdown options based on the current category
  const renderSortKeyOptions = () => {
    return Object.keys(displayNames).map((displayName) => (
      <SelectItem key={displayName} value={displayNames[displayName]}>
        {displayName}
      </SelectItem>
    ));
  };
  // Determine the categories for the BarChart based on the selected category
  let chartCategories = [];
  if (selectedCategory === DataCategories.TotalCounts) {
    chartCategories = ['0'];
  } else if (selectedCategory === DataCategories.GenderCounts) {
    chartCategories = ['male', 'female'];
  } else if (selectedCategory === DataCategories.RacialCounts) {
    chartCategories = [
      'white/caucasian',
      'black/african american',
      'asian',
      'hispanic/latino',
      'pacific islander',
      'native american/indigenous'
    ];
  }

  const chartColors = [
    'blue',
    'red',
    'orange',
    'amber',
    'purple',
    'lime',
    'green',
    'pink',
    'emerald',
    'cyan',
    'teal',
    'yellow',
    'zinc',
    'stone',
    'sky',
    'indigo',
    'neutral',
    'violet',
    'slate',
    'fuchsia',
    'rose',
    'gray'
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {/* {isClient && (
        <Joyride
          continuous
          run={runTour}
          scrollToFirstStep
          showProgress
          showSkipButton
          steps={steps}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              zIndex: 10000 // Ensure Joyride tooltip is above other elements
            }
          }}
        />
      )} */}
      <section className="flex-col justify-center items-center space-y-6 pb-8 pt-5 md:pb-12 md:pt-5 lg:pb-32 lg:pt-5">
        <div
          className="flex flex-col items-center"
          style={{ paddingRight: `8vw`, paddingLeft: `8vw` }}
        >
          <Card>
            <TabGroup
              index={Object.values(DataCategories).indexOf(selectedCategory)}
              onIndexChange={(index) =>
                setSelectedCategory(Object.values(DataCategories)[index])
              }
            >
              <TabList className="mb-4" variant="line">
                <Tab>Total Counts</Tab>
                <Tab>Gender Counts</Tab>
                <Tab>Racial Counts</Tab>
                {/* <button
                  onClick={() =>
                    (window.location.href = 'https://www.crosscare.net/docs')
                  } 
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit' 
                  }}
                  title="Documentation"
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="lg" />{' '}
                </button> */}
              </TabList>
            </TabGroup>
            <Title>Dynamic Disease Data Visualization</Title>
            <Subtitle>
              Counts per disease overall and for each subgroup.
            </Subtitle>

            <div className='grid grid-cols-1'
              style={{
                width: '100%', // Make the div fill the width of its parent
              }}
            >
              {/* Disease Multiselect */}
              <MultiSelect
              className=''
                value={selectedDiseases}
                onValueChange={setSelectedDiseases}
                placeholder="Select Diseases"
                style={{ marginTop:'1em', marginBottom:'1em'}}
              >
                {diseaseNames.map((disease) => (
                  <MultiSelectItem key={disease} value={disease}>
                    {disease}
                  </MultiSelectItem>
                ))}
              </MultiSelect>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3' style={{  marginBottom:'1em'}}>

                
              {/* Window Dropdown */}
              {selectedCategory !== DataCategories.TotalCounts && (
                <Select
                  value={selectedWindow}
                  onValueChange={setSelectedWindow}
                  style={{
                    opacity: dataSource === DataSourceOptions.Pile ? 0.3 : 1, // Shadowed effect when disabled
                    pointerEvents:
                      dataSource === DataSourceOptions.Pile ? 'none' : 'auto' // Disables interaction
                  }}
                >
                  {Object.entries(WindowOptions).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key}
                    </SelectItem>
                  ))}
                </Select>
              )}

              {/* Sort Key Dropdown */}
              <Select
              className=''
                value={sortKey}
                onValueChange={setSortKey}
                style={{  }}
              >
                {renderSortKeyOptions()}
              </Select>

              {/* Data Source Dropdown */}
              <Select
              className=''
                value={dataSource}
                onValueChange={setDataSource}
                style={{   }}
              >
                {Object.entries(DataSourceOptions).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </Select>
              </div>
              <div className='flex flex-row' style={{alignItems:'center'}}>

              
              {/* Sort Order Button */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="btn"
                style={{
                  marginTop: '0px',
                  width:'9em',
                }}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>

              {/* Download Button with Icon */}
              <button
                onClick={() => downloadJsonData('chartData')}
                style={{
                  backgroundColor: 'transparent',
                  color: 'black',
                  width: '0.7em',
                  marginInline:'1.5em',
                  marginTop: '0px',
                }}
                className="btn"
              >
                <FileDownloadIcon />
              </button>
              </div>
            </div>
            <BarChart
              className="mt-4 h-80"
              data={dataToShow}
              index="disease"
              categories={chartCategories}
              colors={chartColors}
              stack={false} // Set to true for stacked bar chart
              yAxisWidth={60}
            />
          </Card>
        </div>
        {selectedCategory !== DataCategories.TotalCounts && (
          <div className="flex flex-col items-center" style={{paddingRight: `8vw`, paddingLeft: `8vw`}}>
            <Card>
              <TabGroup
                index={Object.values(DataCategories).indexOf(selectedCategory)}
                onIndexChange={(index) =>
                  setSelectedCategory(Object.values(DataCategories)[index])
                }
              >
                <TabList className="mb-4" variant="line">
                  <Tab>Total Counts</Tab>
                  <Tab>Gender Counts</Tab>
                  <Tab>Racial Counts</Tab>
                </TabList>
              </TabGroup>
              <Title>Real World Representativeness</Title>
              <Subtitle>
                The actual occurrence rate of a condition or characteristic
                within a specific population, observed in everyday,
                non-experimental settings.
              </Subtitle>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flex: '70%'
                }}
              >
                {/* Disease Multiselect */}
                <MultiSelect
                  value={selectedDiseases}
                  onValueChange={setSelectedDiseases}
                  placeholder="Select Diseases"
                  style={{ flex: '30%' }}
                >
                  {diseaseNames.map((disease) => (
                    <MultiSelectItem key={disease} value={disease}>
                      {disease}
                    </MultiSelectItem>
                  ))}
                </MultiSelect>

                {/* Download Button with Icon */}
                <button
                  onClick={() => downloadJsonData('additionalChartData')}
                  style={{
                    backgroundColor: 'white',
                    color: 'black',
                    flex: '20px',
                    marginLeft: '10px'
                  }}
                  className="btn mt-4"
                >
                  <FileDownloadIcon />
                </button>
              </div>
              <BarChart
                className="mt-4 h-80"
                data={getSortedAdditionalChartData()}
                index="disease"
                categories={chartCategories}
                colors={chartColors}
                stack={false} // Set to true for stacked bar chart
                yAxisWidth={60}
              />
            </Card>
          </div>
        )}
      </section>
    </>
  );
};

export default ChartPage;
