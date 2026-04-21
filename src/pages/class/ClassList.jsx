import React, { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../../layout/Layout";
import MUIDataTable from "mui-datatables";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ContextPanel } from "../../utils/ContextPanel";
import { MdEdit } from "react-icons/md";
import { Email, GroupAdd, Visibility, WhatsApp } from "@mui/icons-material";
import moment from "moment";
import { Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Edit from "@mui/icons-material/Edit";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import { toast } from "react-toastify";
import {
  ClassAddAttendance,
  ClassCreate,
  ClassEdit,
  ClassMail,
  ClassSendNotification,
  ClassView,
  ClassWhatsapp,
} from "../../components/buttonIndex/ButtonComponents";
import { ButtonCreate } from "../../components/common/ButtonCss";
import { Input } from "@material-tailwind/react";

const ClassList = () => {
  const [classListData, setClassListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classDate, setClassDate] = useState(
    localStorage.getItem("class_date_filter") || ""
  );
  const { isPanelUp } = useContext(ContextPanel);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "0");

  const [shouldRefetch, setShouldRefetch] = useState(false);

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
      { replace: true }
    );
  };

  const handlePageChange = (currentPage) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set("page", currentPage.toString());
        return params;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-class-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const res = response.data?.class;
        if (Array.isArray(res)) {
          const tempRows = res.map((item) => [
            moment(item["class_date"]).format("DD-MM-YYYY"),
            item["class_time"],
            item["class_to_time"],
            item["class_subject"],
            item["class_status"],
            item["id"],
          ]);
          setClassListData(tempRows);
        }

        // setClassListData(response.data?.class);
      } catch (error) {
        console.error("Error fetching class data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
    setLoading(false);
  }, [shouldRefetch]);

  const updateData = (e, value) => {
    e.preventDefault();
    axios({
      url: BASE_URL + "/api/panel-update-class-status/" + value,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.status == 200) {
        toast.success("Data Update Sucessfully");
        setShouldRefetch(true);
      } else {
        toast.error("Error in Updating");
      }
    });
  };

  const sendclassEmail = (e, value) => {
    e.preventDefault();
    let data = {
      class_id: value,
    };
    axios({
      url: BASE_URL + "/api/panel-send-email-template-class",
      method: "post",
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.status == "200") {
        toast.success("Email Sent Sucessfully");
      } else {
        toast.error("Email Not Sent Sucessfully");
      }
    });
  };

  const classwhatsApp = (e, value) => {
    e.preventDefault();

    axios({
      url: BASE_URL + "/api/panel-fetch-class-by-id/" + value,
      method: "get",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      const phoneNumber = "+91";
      const message = `Hello dear,
        \n
        *Reminder: Your next live class.*
        \n
        Details : 
        \n
        Date : ${res.data.class.class_date}
        \n
        Time : ${res.data.class.class_time} (please adjust for your time zone)
        \n
        Platform : Microsoft Teams
        \n
        Meeting Link : ${res.data.class.class_url}
        \n
        Please join on time. Let me know if you have any questions!
        \n
        Best Regards,\n
        *Sadaf Choudhary*\n
        Sr. Officer- Coordination\n
        Academy of Internal Audit\n
        C-826, Vipul Plaza, Sector-81`;
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappLink, "_blank");
    });
  };

  const mobilenotification = (e, value) => {
    e.preventDefault();
    const data = {
      class_id: value,
    };
    axios({
      url: BASE_URL + "/api/panel-create-class-notification",
      method: "POST",
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.status == "200") {
        toast.success("Notification Sent Sucessfully");
      } else {
        toast.error("Notification Not Sent Sucessfully");
      }
    });
  };

  const columns = [
    {
      name: "class_date",
      label: "Date",
      options: {
        filter: false,
        sort: true,
        /* customBodyRender: (value) => {
          return moment(value).format("DD-MM-YYYY");
        }, */
      },
    },
    {
      name: "class_time",
      label: "Time",
      options: {
        filter: true,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          const time_class = tableMeta.rowData[1];
          const time_class_to = tableMeta.rowData[2];
          return `${time_class} - ${time_class_to}`;
        },
      },
    },
    {
      name: "class_to_time",
      label: "Time To",
      options: {
        display: false,
      },
    },
    {
      name: "class_subject",
      label: "Subject",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "class_status",
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
        customBodyRender: (id, statusValue) => {
          const status = classListData[statusValue.rowIndex][4];

          return (
            <div className="flex items-center space-x-2">
              {status == "Inactive" && (
                <Tooltip title="View" placement="top">
                  <ClassView
                    onClick={() =>
                      navigate(`/view-class/${id}?${searchParams.toString()}`)
                    }
                    className="h-5 w-5 cursor-pointer"
                  />
                </Tooltip>
              )}
              {status == "Active" && (
                <Tooltip title="Update Status" placement="top">
                  <ClassEdit
                    onClick={(e) => updateData(e, id)}
                    className="h-5 w-5 cursor-pointer"
                  />
                </Tooltip>
              )}
              {status == "Active" && (
                <Tooltip title="Send Email" placement="top">
                  <ClassMail
                    onClick={(e) => sendclassEmail(e, id)}
                    className="h-5 w-5 cursor-pointer"
                  />
                </Tooltip>
              )}
              {status == "Active" && (
                <Tooltip title="Send Whatsapp" placement="top">
                  <ClassWhatsapp
                    onClick={(e) => classwhatsApp(e, id)}
                    className="cursor-pointer"
                  />
                </Tooltip>
              )}
              {status == "Active" && (
                <Tooltip title="Mobile Notification" placement="top">
                  <ClassSendNotification
                    onClick={(e) => mobilenotification(e, id)}
                    className="h-5 w-5 cursor-pointer"
                  />
                </Tooltip>
              )}
              {status == "Active" && (
                <Tooltip title="Add Attendence" placement="top">
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/add-attendence/${id}?${searchParams.toString()}`
                      )
                    }
                  >
                    <ClassAddAttendance className="h-5 w-5 cursor-pointer" />
                  </div>
                </Tooltip>
              )}
            </div>
          );
        },
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!classListData) return [];

    return classListData.filter((item) => {
      const matchesClassDate = classDate
        ? moment(item[0], "DD-MM-YYYY").format("YYYY-MM-DD") === classDate
        : true;

      return matchesClassDate;
    });
  }, [classListData, classDate]);

  const options = {
    selectableRows: "none",
    elevation: 0,
    responsive: "standard",
    viewColumns: true,
    download: true,
    filter: false,
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
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Class List
        </h3>

        <div className="flex gap-4">
          <Input
            label="Date"
            type="date"
            value={classDate}
            onChange={(e) => {
              setClassDate(e.target.value);
              localStorage.setItem("class_date_filter", e.target.value);
            }}
          ></Input>
          <button
            onClick={() => {
              setClassDate("");
              localStorage.removeItem("class_date_filter");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Clear
          </button>
        </div>

        <ClassCreate
          className={ButtonCreate}
          onClick={() => navigate(`/add-class?${searchParams.toString()}`)}
        ></ClassCreate>
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

export default ClassList;
