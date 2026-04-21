import React, { useContext, useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { ContextPanel } from "../../utils/ContextPanel";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../base/BaseUrl";
import MUIDataTable from "mui-datatables";
import moment from "moment";
import { NotificationCreate } from "../../components/buttonIndex/ButtonComponents";
import { ButtonCreate } from "../../components/common/ButtonCss";

const NotificationList = () => {
  const [notificationListData, setCNotificationListData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isPanelUp } = useContext(ContextPanel);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get("page") || "0", 10);
  const searchParam = searchParams.get("search") || "";

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        if (!isPanelUp) {
          navigate("/maintenance");
          return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${BASE_URL}/api/panel-fetch-notification-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const res = response.data?.notification;
        if (Array.isArray(res)) {
          setCNotificationListData(response.data?.notification);
        }
      } catch (error) {
        console.error("Error fetching notification data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationData();
  }, [isPanelUp, navigate]);

  const columns = [
    {
      name: "notification_date",
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
      name: "notification_course",
      label: "Notification",
      options: {
        filter: true,
        sort: false,
      },
    },
    {
      name: "notification_heading",
      label: "Heading",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "notification_description",
      label: "Details",
      options: {
        filter: false,
        sort: false,
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
        setSearchParams({
          search: tableState.searchText || "",
          page: tableState.page.toString(),
        });
      }
    },
    onSearchChange: (searchText) => {
      setSearchParams({ search: searchText || "", page: "0" });
    },
  };
  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-center bg-white mt-5 p-2 rounded-lg space-y-4 md:space-y-0">
        <h3 className="text-center md:text-left text-lg md:text-xl font-bold">
          Notification List
        </h3>
        <NotificationCreate
          className={ButtonCreate}
          onClick={() => navigate(`/add-notification${location.search}`)}
        ></NotificationCreate>
      </div>
      <div className="mt-5">
        <MUIDataTable
          data={notificationListData ? notificationListData : []}
          columns={columns}
          options={options}
        />
      </div>
    </Layout>
  );
};

export default NotificationList;
