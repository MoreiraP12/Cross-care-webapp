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
  LineChart,
  NumberInput,
  CalendarIcon
} from '@tremor/react';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const DataCategories = {
  TotalCounts: 'total',
  TimeCounts: 'time'
};

const WindowOptions = {
  Total: 'total'
};

const TimeOptions = {
  Monthly: 'monthly',
  Yearly: 'yearly',
  Five_Yearly: 'five_yearly'
};

const initialDiseaseList = [
  'lupus',
  'mental illness',
  'suicide',
  'ibs',
  'tuberculoses',
  'diabetes',
  'sarcoidoses',
  'pneumonia',
  ' mi ',
  'covid-19',
  'dementia',
  'multiple sclerosis',
  'infection'
];

const DataSourceOptions = {
  Arxiv: 'arxiv',
  Github: 'github',
  Wikipedia: 'wikipedia', // Change the URL to your custom data source endpoint
  StackExchange: 'stackexchange'
};

const ChartPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(
    DataCategories.TotalCounts
  );
  const [sortKey, setSortKey] = useState('disease');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedWindow, setSelectedWindow] = useState(WindowOptions.Total);
  const [selectedTime, setTime] = useState(TimeOptions.Yearly);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [dataSource, setDataSource] = useState(DataSourceOptions.Arxiv); // State for selected data source
  const [diseaseNames, setDiseaseNames] = useState([]);
  const [yearStart, setYearStart] = useState(new Date().getFullYear() - 10); // 5 years ago as default
  const [yearEnd, setYearEnd] = useState(new Date().getFullYear()); // Current year as default
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
    [DataCategories.TotalCounts]: ['disease', '0']
  };

  const totalDisplayNames = {
    Disease: 'disease',
    Count: '0'
  };

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

  const [temporalChartData, setTemporalChartData] = useState([]);

  const fetchTemporalChartData = async () => {
    const selectedDiseasesString = selectedDiseases.join(',');
    try {
      const response = await fetch(
        `https://cryptic-forest-27973-570a247a72c1.herokuapp.com/get-temporal-chart-data?category=${selectedCategory}&timeOption=${selectedTime}&sortKey=${sortKey}&sortOrder=${sortOrder}&startYear=${yearStart}&endYear=${yearEnd}&selectedDiseases=${selectedDiseasesString}&dataSource=${dataSource}`
      );
      if (response.ok) {
        const fetchedData = await response.json();
        setTemporalChartData(fetchedData);
        console.log('Temporal Chart Data:', temporalChartData);
      } else {
        console.error('Server error:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  useEffect(() => {
    fetchTemporalChartData();
  }, [
    selectedCategory,
    selectedTime,
    sortKey,
    sortOrder,
    dataSource,
    currentPage,
    selectedDiseases,
    yearStart,
    yearEnd
  ]);

  const [enableLegendSlider, setEnableLegendSlider] = useState(true); // State to manage legend slider
  // Determine display names based on selected category
  let displayNames = {};
  if (selectedCategory === DataCategories.TotalCounts) {
    displayNames = totalDisplayNames;
  }

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

  const downloadJsonData = () => {
    // Create a JSON string from the temporalChartData
    const jsonData = JSON.stringify(temporalChartData);

    // Create a Blob object containing the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a download link element
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);

    // Determine the filename based on the data
    const filename = 'temporalChartData.json'; // You can change the filename as needed
    a.download = filename;

    // Trigger a click event to initiate the download
    a.click();
  };

  const renderDownloadButton = (onClickHandler) => {
    return (
      <button
        onClick={onClickHandler}
        style={{
          backgroundColor: 'transparent',
          color: 'black',
          width: '0.7em',
          marginInline:'1.5em',
          marginTop: '0px',
        }}
        className="btn"
        title="Download JSON Data"
      >
        <FileDownloadIcon />
      </button>
    );
  };

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
                {/* <button
                  onClick={() =>
                    (window.location.href = 'https://www.crosscare.net/docs')
                  }
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit' // Adjust color to fit your design
                  }}
                  title="Documentation"
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="lg" />{' '}
                </button> */}
              </TabList>
            </TabGroup>
            <Title>Representation Trends</Title>
            <Subtitle>Disease counts over time.</Subtitle>
            <div
            className='grid grid-cols-1'
              style={{
                width: '100%', // Make the div fill the width of its parent
              }}
            >
              <div className='grid grid-cols-1 md:grid-cols-4 gap-3' style={{ marginTop:'1em', marginBottom:'1em'}} > 
              {/* Disease MultiSelect with value bound to selectedDiseases */}
              <MultiSelect
              className='md:col-span-3'
                value={selectedDiseases}
                onValueChange={setSelectedDiseases}
                placeholder="Select Diseases"
                style={{  }}
              >
                {diseaseNames.map((disease) => (
                  <MultiSelectItem key={disease} value={disease}>
                    {disease}
                  </MultiSelectItem>
                ))}
              </MultiSelect>

              {/* Data Source Dropdown */}
              <Select
                value={dataSource}
                onValueChange={setDataSource}
              >
                {Object.entries(DataSourceOptions).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {key}
                  </SelectItem>
                ))}
              </Select> 
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3' style={{  marginBottom:'1em'}}>
                <Select
                value={selectedTime}
                onValueChange={setTime}
                placeholder="Select Time Option"
                style={{  }}
              >
                {Object.keys(TimeOptions).map((option) => (
                  <SelectItem key={option} value={TimeOptions[option]}>
                    {option}
                  </SelectItem>
                ))}
              </Select>

              {/* Year Start Input */}
              <div style={{ }} className="input-wrapper">
                <NumberInput
                  icon={CalendarIcon}
                  placeholder="Start Year"
                  value={yearStart}
                  onChange={(e) => setYearStart(e.target.value)}
                  min={2000} // Set minimum year as required
                  max={yearEnd} // Maximum is the end year
                />
              </div>

              {/* Year End Input */}
              <div style={{ }} className="input-wrapper">
                <NumberInput
                  icon={CalendarIcon}
                  placeholder="End Year"
                  value={yearEnd}
                  onChange={(e) => setYearEnd(e.target.value)}
                  min={yearStart} // Minimum is the start year
                  max={new Date().getFullYear()} // Set maximum year as the current year
                />
              </div>
              </div>

              <div className='flex flex-row'>

              {/* Sort Order Button */}
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="btn mt4"
                style={{
                  marginTop: '0px',
                  width:'9em',
                }}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>

              {/* Download Button with Icon */}
              {renderDownloadButton(() => downloadJsonData())}
              </div>
              

            </div>
            <LineChart
              className="mt-4 h-80"
              data={temporalChartData}
              index="date"
              categories={selectedDiseases}
              colors={chartColors}
              yAxisWidth={60}
              enableLegendSlider={true} // Use the state here
              showAnimation={true}
            />
          </Card>
        </div>
      </section>
    </>
  );
};
export default ChartPage;
