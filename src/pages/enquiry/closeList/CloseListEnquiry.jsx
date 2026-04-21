import { useContext, useState, useEffect, useMemo } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { ContextPanel } from "../../../utils/ContextPanel";
import EnquiryFilter from "../../../components/EnquiryFilter";
import Layout from "../../../layout/Layout";
import axios from "axios";
import BASE_URL from "../../../base/BaseUrl";
import { MdEdit } from "react-icons/md";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MUIDataTable from "mui-datatables";
import moment from "moment";
import {
  EnquiryCloseCreate,
  EnquiryCloseEdit,
  EnquiryCloseView,
} from "../../../components/buttonIndex/ButtonComponents";

import { ButtonCreate } from "../../../components/common/ButtonCss";
import { Input } from "@material-tailwind/react";

const CloseListEnquiry = () => {
  const [closeListData, setCloseListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enquiryDate, setEnquiryDate] = useState(
    localStorage.getItem("enquiry_date_close_filter") || "",
  );
  const [followupDate, setFollowupDate] = useState(
    localStorage.getItem("followup_date_close_filter") || "",
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
    const fetchCloseData = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-closed-enquiry-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setCloseListData(response.data?.enquiry);
      } catch (error) {
        console.error("Error fetching close list enquiry data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCloseData();
    setLoading(false);
  }, []);

  const columns = [
    {
      name: "enquiry_no",
      label: "Enquiry No",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "enquiry_date",
      label: "Enquiry Date",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return moment(value).format("DD-MM-YYYY");
        },
      },
    },
    {
      name: "enquiry_follow_date",
      label: "Followup Date",
      options: {
        filter: false,
        sort: true,
        customBodyRender: (value) => {
          return moment(value).format("DD-MM-YYYY");
        },
      },
    },
    {
      name: "enquiry_full_name",
      label: "Full Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "enquiry_mobile",
      label: "Mobile No",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "enquiry_city",
      label: "City",
      options: {
        filter: false,
        sort: false,
      },
    },

    {
      name: "enquiry_course",
      label: "Courses",
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "enquiry_employee_name",
      label: "Employee Name",
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "enquiry_status",
      label: "Status",
      options: {
        filter: false,
        sort: true,
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
              {/* <MdEdit
                title="edit"
                onClick={(e) => handleOpenButtonLink(e, `${id}`)}
                className="h-5 w-5 cursor-pointer"
              /> */}
              <EnquiryCloseEdit
                onClick={(e) => handleOpenButtonLink(e, `${id}`)}
                className="h-5 w-5 cursor-pointer"
              />
              {/* <MdOutlineRemoveRedEye
               onClick={(e) => handleOpenButtonLinkView(e,`${id}`)}
              <MdOutlineRemoveRedEye
                onClick={(e) => handleOpenButtonLinkView(e, `${id}`)}
                title="view"
                className="h-5 w-5 cursor-pointer"
              /> */}
              <EnquiryCloseView
                onClick={(e) => handleOpenButtonLinkView(e, `${id}`)}
                className="h-5 w-5 cursor-pointer"
              />
            </div>
          );
        },
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!closeListData) return [];
    return closeListData.filter((item) => {
      const matchesEnquiryDate = enquiryDate
        ? moment(item.enquiry_date).format("YYYY-MM-DD") === enquiryDate
        : true;
      const matchesFollowupDate = followupDate
        ? moment(item.enquiry_follow_date).format("YYYY-MM-DD") === followupDate
        : true;

      return matchesEnquiryDate && matchesFollowupDate;
    });
  }, [closeListData, enquiryDate, followupDate]);

  const options = {
    selectableRows: "none",
    elevation: 0,
    responsive: "standard",
    viewColumns: true,
    download: true,
    print: true,
    filter: false,
    searchText: searchQuery,
    page: page,
    searchOpen: true,
    searchPlaceholder: "Search...",
    onSearchChange: (searchText) => handleSearch(searchText),
    onChangePage: (currentPage) => handlePageChange(currentPage),
  };
  const handleOpenButton = (e) => {
    e.preventDefault();
    localStorage.setItem("enquiry_page", location.pathname);
    navigate(`/add-enquiry?${searchParams.toString()}`);
  };

  const handleOpenButtonLink = (e, value) => {
    e.preventDefault();
    localStorage.setItem("enquiry_page", location.pathname);
    navigate(`/edit-enquiry/${value}?${searchParams.toString()}`);
  };

  const handleOpenButtonLinkView = (e, value) => {
    e.preventDefault();
    localStorage.setItem("enquiry_page", location.pathname);
    navigate(`/view-enquiry/${value}?${searchParams.toString()}`);
  };

  return (
    <Layout>
      <EnquiryFilter />
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Enquiry Close List
        </h3>

        <div className="flex gap-4">
          <Input
            label="Enquiry Date"
            type="date"
            max={moment().format("YYYY-MM-DD")}
            value={enquiryDate}
            onChange={(e) => {
              setEnquiryDate(e.target.value);
              localStorage.setItem("enquiry_date_close_filter", e.target.value);
            }}
          ></Input>
          <Input
            label="Followup Date"
            type="date"
            value={followupDate}
            onChange={(e) => {
              setFollowupDate(e.target.value);
              localStorage.setItem(
                "followup_date_close_filter",
                e.target.value,
              );
            }}
          ></Input>
          <button
            onClick={() => {
              setEnquiryDate("");
              setFollowupDate("");
              localStorage.removeItem("enquiry_date_close_filter");
              localStorage.removeItem("followup_date_close_filter");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Clear
          </button>
        </div>

        <EnquiryCloseCreate
          onClick={handleOpenButton}
          className={ButtonCreate}
        />
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

export default CloseListEnquiry;
