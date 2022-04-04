import { useState, useEffect } from 'react';
import {
  Header,
  Icon,
  Loader,
  Popup,
} from 'semantic-ui-react'
import { DataTable } from './components/DataTable'
import { Pagination } from './components/Pagination'
// import { gql, useQuery } from '@apollo/client';

const defaultData = [
  { iconExample: true }, {}, {}, {}, {}, {}, {}, {}, {}, {},
]

const UpToDateIcon = () => {
  const icon = <Icon name="checkmark" color="green" />;
  return <Popup content="Up to Date" trigger={icon} />;
};

const UpdateInProgressIcon = () => {
  const icon = <Loader active inline size="tiny" />;
  return <Popup content="Update In Progress" trigger={icon} />;
}

const UnauthorizedUserIcon = () => {
  const icon = <Icon name="warning sign" color="yellow" />;
  return <Popup content="Not Authorized" trigger={icon} />;
}

const columns = [
  {
    id: 'status',
    render: (row) => (row.version === row.latest_version) && <UpToDateIcon /> || !row.updated && <UpdateInProgressIcon />,
    collapsing: true
  },
  {
    id: 'user_email',
    header: 'User Email',
    render: (row) => (
      <>
        {row.user_email}
        &nbsp;
        {!row.admin && <UnauthorizedUserIcon />}
      </>
    ),
  },
  //
  {
    id: 'name',
    header: 'Name',
    render: (row) => row.name,
  },
  {
    id: 'version',
    header: 'Firmware',
    render: (row) => row.version,
  },
  {
    id: 'updated',
    header: 'Last Updated',
    render: (row) => row.updated,
  },
]

function App() {

  const [data, setData] = useState(defaultData)
  const [orderBy, setOrderBy] = useState('name')
  const [direction, setDirection] = useState('asc')
  const [offset, setOffset] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(()=>{
    fetchDevices()
  }, [size, offset, orderBy, direction]);

  const sortColumn = async (column) => {
    if(orderBy === column.id){
      direction === 'asc' ? setDirection('desc') : setDirection('asc')
    } else {
      setOrderBy(column.id)
    }
    fetchDevices()
  }

  const fetchDevices = async ( ) => {    
    try {
      const response = await fetch(`http://localhost:3001/devices?limit=${size}&offset=${offset}&orderBy=${orderBy}&direction=${direction}`, {
        method: "GET",
          headers: {
          'Accept': 'application/json'
        }
      })
      const parsedResponse = await response.json()
      setData(parsedResponse)
      if(parsedResponse.length > 0 & parsedResponse[0].hasOwnProperty('total') ) setTotalPages( Math.ceil(parsedResponse[0].total/size) )
    } catch (err) {
      console.error(err.message)
    }
  }

  return (
    <DataTable
      data={data}
      sortBy={orderBy}
      direction={direction}
      columns={columns}
      sort={sortColumn}
      header={<Header>Devices to Update</Header>} //\\
      footer={
        <Pagination
          current={currentPage}
          total={totalPages}
          size={size}
          sizes={[10, 20, 100]}
          setCurrent={(current) => { 
            setCurrentPage(current); setOffset( (current - 1) * size );
            } 
          }
          setSize={(size) => {setSize(size)}}
        />
      }
    />
  );
}

export default App;
