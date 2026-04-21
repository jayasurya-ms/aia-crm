import React, { useContext, useEffect, useState } from "react";
import Layout from "../../../layout/Layout";
import TaskManagerFilter from "../../../components/TaskManagerFilter";
import { ContextPanel } from "../../../utils/ContextPanel";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../base/BaseUrl";
import { MdEdit } from "react-icons/md";
import MUIDataTable from "mui-datatables";
import moment from "moment";

const OverDueTaskList = () => {
  const [pendingTListData, setPendingTListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isPanelUp } = useContext(ContextPanel);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get("page") || "0", 10);
  const searchParam = searchParams.get("search") || "";

  useEffect(() => {
    const fetchPendingTData = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-taskmanager-overdue-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let res = response.data?.taskmanager;
        if (Array.isArray(res)) {
          setPendingTListData(response.data?.taskmanager);
        }
      } catch (error) {
        console.error("Error fetching pending list task manager data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingTData();
    setLoading(false);
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
              <MdEdit
                onClick={() => navigate(`/edit-task/${id}${location.search}`)}
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
    page: pageParam,
    searchText: searchParam,
    searchOpen: true,
    searchPlaceholder: "Search...",
    onTableChange: (action, tableState) => {
      if (action === "changePage") {
        setSearchParams({ search: tableState.searchText || "", page: tableState.page.toString() });
      }
    },
    onSearchChange: (searchText) => {
      setSearchParams({ search: searchText || "", page: "0" });
    },
    setRowProps: (rowData) => {
      return {
        style: {
          borderBottom: "10px solid #f1f7f9",
        },
      };
    },
  };
  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Over Due Task List
        </h3>

        <button
          onClick={() => navigate(`/add-task${location.search}`)}
          className="btn btn-primary text-center md:text-right text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md"
        >
          + Add Task
        </button>
      </div>
      <div className="mt-5">
        <MUIDataTable
          data={pendingTListData ? pendingTListData : []}
          columns={columns}
          options={options}
        />
      </div>
    </Layout>
  );
};

export default OverDueTaskList;
