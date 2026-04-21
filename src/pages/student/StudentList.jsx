import { CircularProgress } from "@mui/material";
import axios from "axios";
import moment from "moment";
import MUIDataTable from "mui-datatables";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../base/BaseUrl";
import { StudentView } from "../../components/buttonIndex/ButtonComponents";
import Layout from "../../layout/Layout";
import { Input } from "@material-tailwind/react";

const StudentList = () => {
  const [studentListData, setStudentListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enquiryDate, setEnquiryDate] = useState(
    localStorage.getItem("enquiry_date_student_filter") || ""
  );
  const [regDate, setRegDate] = useState(
    localStorage.getItem("reg_date_student_filter") || ""
  );
  const navigate = useNavigate();
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
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-student-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const res = response.data?.student;

        if (Array.isArray(res)) {
          setStudentListData(response.data?.student);
        }
      } catch (error) {
        console.error("Error fetching student data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
    setLoading(false);
  }, []);

  const columns = [
    {
      name: "user_uid",
      label: "UID",
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
      name: "registration_date",
      label: "Reg Date",
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
      name: "mobile",
      label: "Mobile",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "qualification",
      label: "Qualification",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "admission_form_no",
      label: "Admission No",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "employee_name",
      label: "Employee Name",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "status",
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
              <StudentView
                onClick={() =>
                  navigate(`/view-student/${id}?${searchParams.toString()}`)
                }
                className="h-5 w-5 cursor-pointer"
              />
            </div>
          );
        },
      },
    },
  ];

  const filteredData = useMemo(() => {
    if (!studentListData) return [];
    return studentListData.filter((item) => {
      const matchesEnquiryDate = enquiryDate
        ? moment(item.enquiry_date).format("YYYY-MM-DD") === enquiryDate
        : true;
      const matchesRegDate = regDate
        ? moment(item.registration_date).format("YYYY-MM-DD") === regDate
        : true;

      return matchesEnquiryDate && matchesRegDate;
    });
  }, [studentListData, enquiryDate, regDate]);

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

  const emailnotification = (e) => {
    e.preventDefault();
    setLoading(true);
    axios({
      url: BASE_URL + "/api/panel-send-email-notification",
      method: "get",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (res.data.code == "200") {
        toast.success("Notification Sent Sucessfully");
        setLoading(false);
      } else {
        toast.error("Notification Not Sent Sucessfully");
        setLoading(false);
      }
    });
  };

  return (
    <>
      {loading && (
        <CircularProgress
          disableShrink
          style={{
            marginLeft: "600px",
            marginTop: "300px",
            marginBottom: "300px",
          }}
          color="secondary"
        />
      )}
      {!loading && (
        <Layout>
          <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
            <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
              Student List
            </h3>

            <div className="flex gap-4">
              <Input
                label="Enquiry Date"
                type="date"
                max={moment().format("YYYY-MM-DD")}
                value={enquiryDate}
                onChange={(e) => {
                  setEnquiryDate(e.target.value);
                  localStorage.setItem(
                    "enquiry_date_student_filter",
                    e.target.value
                  );
                }}
              ></Input>
              <Input
                label="Registration Date"
                type="date"
                max={moment().format("YYYY-MM-DD")}
                value={regDate}
                onChange={(e) => {
                  setRegDate(e.target.value);
                  localStorage.setItem(
                    "reg_date_student_filter",
                    e.target.value
                  );
                }}
              ></Input>
              <button
                onClick={() => {
                  setEnquiryDate("");
                  setRegDate("");
                  localStorage.removeItem("enquiry_date_student_filter");
                  localStorage.removeItem("reg_date_student_filter");
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="mt-5">
            <MUIDataTable
              data={filteredData ? filteredData : []}
              columns={columns}
              options={options}
            />
          </div>
        </Layout>
      )}
    </>
  );
};

export default StudentList;
