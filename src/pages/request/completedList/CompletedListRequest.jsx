import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../../../layout/Layout";
import RequestFilter from "../../../components/RequestFilter";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../base/BaseUrl";
import MUIDataTable from "mui-datatables";
import { ContextPanel } from "../../../utils/ContextPanel";
import moment from "moment";
import { RequestCompletedCreate } from "../../../components/buttonIndex/ButtonComponents";
import { ButtonCreate } from "../../../components/common/ButtonCss";
import { Input } from "@material-tailwind/react";

const CompletedListRequest = () => {
  const [completedRListData, setCompletedRListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestDate, setRequestDate] = useState(
    localStorage.getItem("request_date_completed_filter") || "",
  );
  const { isPanelUp } = useContext(ContextPanel);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0");

  const handleSearch = (value) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (value) {
          params.set("search", value);
        } else {
          params.delete("search");
        }
        params.set("page", "0");
        return params;
      },
      { replace: true },
    );
  };

  const handlePageChange = (currentPage) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", currentPage.toString());
        return params;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    const fetchCompletyedRData = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-request-notpending-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const res = response.data?.urequest;
        if (Array.isArray(res)) {
          const tempRows = res.map((item) => [
            moment(item["course_request_date"]).format("DD-MM-YYYY"),
            item["name"],
            item["course_opted"],
            item["course_request"],
            item["course_request_remarks"],
            item["course_request_status"],
            item["id"],
          ]);
          setCompletedRListData(response.data?.urequest);
        }

        // setCompletedRListData(response.data?.urequest);
      } catch (error) {
        console.error("Error fetching completed list request data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompletyedRData();
    setLoading(false);
  }, []);

  const columns = [
    {
      name: "course_request_date",
      label: "Date",
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
      label: "Full Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "course_opted",
      label: "Course",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "course_request",
      label: "Request Type",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "course_request_remarks",
      label: "Remark",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "course_request_status",
      label: "Status",
      options: {
        filter: false,
        sort: false,
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!completedRListData) return [];
    return completedRListData.filter((item) => {
      const matchesRequestDate = requestDate
        ? moment(item.course_request_date).format("YYYY-MM-DD") === requestDate
        : true;

      return matchesRequestDate;
    });
  }, [completedRListData, requestDate]);

  const options = {
    selectableRows: "none",
    elevation: 0,
    filter: false,
    responsive: "standard",
    viewColumns: true,
    download: true,
    print: true,
    searchText: searchQuery,
    page: page,
    searchOpen: true,
    searchPlaceholder: "Search...",
    onSearchChange: (searchText) => handleSearch(searchText),
    onChangePage: (currentPage) => handlePageChange(currentPage),
  };
  return (
    <Layout>
      <RequestFilter />
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Request Completed List
        </h3>

        <div className="flex gap-4">
          <Input
            label="Date"
            type="date"
            max={moment().format("YYYY-MM-DD")}
            value={requestDate}
            onChange={(e) => {
              setRequestDate(e.target.value);
              localStorage.setItem(
                "request_date_completed_filter",
                e.target.value,
              );
            }}
          ></Input>
          <button
            onClick={() => {
              setRequestDate("");
              localStorage.removeItem("request_date_completed_filter");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Clear
          </button>
        </div>

        <RequestCompletedCreate
          className={ButtonCreate}
          onClick={() => navigate(`/add-request?${searchParams.toString()}`)}
        ></RequestCompletedCreate>
      </div>
      <div className="mt-5">
        <MUIDataTable
          data={filteredData ? filteredData : []}
          columns={columns}
          options={options}
        />
      </div>
    </Layout>
  );
};

export default CompletedListRequest;
