import axios from "axios";
import moment from "moment";
import MUIDataTable from "mui-datatables";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../base/BaseUrl";
import {
  TaskManagerPendingCreateRepetitive,
  TaskManagerPendingCreateTask,
  TaskManagerPendingEdit,
} from "../../../components/buttonIndex/ButtonComponents";
import { ButtonCreate } from "../../../components/common/ButtonCss";
import TaskManagerFilter from "../../../components/TaskManagerFilter";
import Layout from "../../../layout/Layout";

const FutureListTask = () => {
  const [futureListData, setFutureListData] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchFutureData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-taskmanager-future-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        let res = response.data?.taskmanager;
        if (Array.isArray(res)) {
          setFutureListData(response.data?.taskmanager);
        }
      } catch (error) {
        console.error("Error fetching pending list task manager data", error);
      }
    };
    fetchFutureData();
  }, []);

  const columns = [
    {
      name: "task_from_date",
      label: "Assign Date",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return moment(value).format("DD-MM-YYYY");
        },
      },
    },
    {
      name: "task_to_date",
      label: "Due Date",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return moment(value).format("DD-MM-YYYY");
        },
      },
    },
    {
      name: "name",
      label: "Employee",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "task_details",
      label: "Task Details",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "task_status",
      label: "Status",
      options: {
        filter: false,
        sort: false,
      },
    },

    {
      name: "id",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (id) => {
          return (
            <div className="flex items-center space-x-2">
              <TaskManagerPendingEdit
                onClick={() => navigate(`/edit-task/${id}`)}
                title="Edit"
                className="h-5 w-5 cursor-pointer"
              />
            </div>
          );
        },
      },
    },
  ];
  const options = {
    selectableRows: "none",
    elevation: 0,

    responsive: "standard",
    viewColumns: true,
    download: true,
    filter: false,
    print: true,
  };
  return (
    <Layout>
      <TaskManagerFilter />
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Task Manager Future List
        </h3>
        <div>
          <TaskManagerPendingCreateTask
            className={ButtonCreate}
            onClick={() => navigate("/add-task")}
          ></TaskManagerPendingCreateTask>
          <TaskManagerPendingCreateRepetitive
            className={ButtonCreate}
            onClick={() => navigate("/add-repetitive")}
          ></TaskManagerPendingCreateRepetitive>
        </div>
      </div>
      <div className="mt-5">
        <MUIDataTable
          data={futureListData ? futureListData : []}
          columns={columns}
          options={options}
        />
      </div>
    </Layout>
  );
};

export default FutureListTask;
