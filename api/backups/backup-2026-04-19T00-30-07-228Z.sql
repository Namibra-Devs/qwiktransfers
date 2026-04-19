--
-- PostgreSQL database dump
--

\restrict 14wdvipV7qO6SEwMvVGrICSbVzokOf3tRCFiV5Lv2jSZX6TMMfYlNHJpmFFrYrr

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_Announcements_target; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Announcements_target" AS ENUM (
    'all',
    'vendors',
    'support',
    'users'
);


ALTER TYPE public."enum_Announcements_target" OWNER TO postgres;

--
-- Name: enum_Announcements_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Announcements_type" AS ENUM (
    'info',
    'warning',
    'success',
    'urgent'
);


ALTER TYPE public."enum_Announcements_type" OWNER TO postgres;

--
-- Name: enum_Complaints_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Complaints_status" AS ENUM (
    'open',
    'resolved',
    'closed'
);


ALTER TYPE public."enum_Complaints_status" OWNER TO postgres;

--
-- Name: enum_Inquiries_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Inquiries_status" AS ENUM (
    'pending',
    'replied',
    'closed'
);


ALTER TYPE public."enum_Inquiries_status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AnnouncementDismissals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AnnouncementDismissals" (
    id integer NOT NULL,
    "announcementId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AnnouncementDismissals" OWNER TO postgres;

--
-- Name: AnnouncementDismissals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AnnouncementDismissals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AnnouncementDismissals_id_seq" OWNER TO postgres;

--
-- Name: AnnouncementDismissals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AnnouncementDismissals_id_seq" OWNED BY public."AnnouncementDismissals".id;


--
-- Name: Announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Announcements" (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type public."enum_Announcements_type" DEFAULT 'info'::public."enum_Announcements_type",
    target public."enum_Announcements_target" DEFAULT 'all'::public."enum_Announcements_target",
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone,
    created_by integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Announcements" OWNER TO postgres;

--
-- Name: Announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Announcements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Announcements_id_seq" OWNER TO postgres;

--
-- Name: Announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Announcements_id_seq" OWNED BY public."Announcements".id;


--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLogs" (
    id integer NOT NULL,
    "userId" integer,
    action character varying(255) NOT NULL,
    details text,
    "ipAddress" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AuditLogs" OWNER TO postgres;

--
-- Name: AuditLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AuditLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AuditLogs_id_seq" OWNER TO postgres;

--
-- Name: AuditLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AuditLogs_id_seq" OWNED BY public."AuditLogs".id;


--
-- Name: Complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Complaints" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    transaction_id integer,
    subject character varying(255) NOT NULL,
    description text NOT NULL,
    status public."enum_Complaints_status" DEFAULT 'open'::public."enum_Complaints_status",
    attachment_url character varying(255),
    admin_response text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Complaints" OWNER TO postgres;

--
-- Name: Complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Complaints_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Complaints_id_seq" OWNER TO postgres;

--
-- Name: Complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Complaints_id_seq" OWNED BY public."Complaints".id;


--
-- Name: Inquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inquiries" (
    id integer NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    status public."enum_Inquiries_status" DEFAULT 'pending'::public."enum_Inquiries_status" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Inquiries" OWNER TO postgres;

--
-- Name: Inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Inquiries_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Inquiries_id_seq" OWNER TO postgres;

--
-- Name: Inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Inquiries_id_seq" OWNED BY public."Inquiries".id;


--
-- Name: Notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notifications" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    type character varying(255) NOT NULL,
    message text NOT NULL,
    "isRead" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    link character varying(255)
);


ALTER TABLE public."Notifications" OWNER TO postgres;

--
-- Name: Notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Notifications_id_seq" OWNER TO postgres;

--
-- Name: Notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notifications_id_seq" OWNED BY public."Notifications".id;


--
-- Name: PaymentMethods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PaymentMethods" (
    id integer NOT NULL,
    type character varying(255),
    currency character varying(255),
    details text,
    is_active boolean,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."PaymentMethods" OWNER TO postgres;

--
-- Name: PaymentMethods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."PaymentMethods_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."PaymentMethods_id_seq" OWNER TO postgres;

--
-- Name: PaymentMethods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."PaymentMethods_id_seq" OWNED BY public."PaymentMethods".id;


--
-- Name: RateAlerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RateAlerts" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "targetRate" numeric NOT NULL,
    direction character varying(255) NOT NULL,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."RateAlerts" OWNER TO postgres;

--
-- Name: RateAlerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."RateAlerts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."RateAlerts_id_seq" OWNER TO postgres;

--
-- Name: RateAlerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."RateAlerts_id_seq" OWNED BY public."RateAlerts".id;


--
-- Name: Rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Rates" (
    id integer NOT NULL,
    pair character varying(255),
    rate numeric,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    use_api boolean DEFAULT true,
    manual_rate numeric(10,4),
    spread numeric(5,2) DEFAULT 5
);


ALTER TABLE public."Rates" OWNER TO postgres;

--
-- Name: Rates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Rates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Rates_id_seq" OWNER TO postgres;

--
-- Name: Rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Rates_id_seq" OWNED BY public."Rates".id;


--
-- Name: Referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Referrals" (
    id integer NOT NULL,
    referrer_id integer NOT NULL,
    referred_user_id integer NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying,
    reward_amount numeric(10,2),
    reward_currency character varying(255) DEFAULT 'GHS'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Referrals" OWNER TO postgres;

--
-- Name: Referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Referrals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Referrals_id_seq" OWNER TO postgres;

--
-- Name: Referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Referrals_id_seq" OWNED BY public."Referrals".id;


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: SystemConfigs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SystemConfigs" (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."SystemConfigs" OWNER TO postgres;

--
-- Name: SystemConfigs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."SystemConfigs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SystemConfigs_id_seq" OWNER TO postgres;

--
-- Name: SystemConfigs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."SystemConfigs_id_seq" OWNED BY public."SystemConfigs".id;


--
-- Name: Transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transactions" (
    id integer NOT NULL,
    "userId" integer,
    type character varying(255),
    amount_sent numeric,
    exchange_rate numeric,
    amount_received numeric,
    recipient_details jsonb,
    status character varying(255),
    proof_url character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    proof_uploaded_at timestamp with time zone,
    "vendorId" integer,
    sent_at timestamp with time zone,
    rate_locked_until timestamp with time zone,
    locked_rate numeric,
    transaction_id character varying(255),
    market_rate numeric,
    base_currency_profit numeric DEFAULT 0,
    rejection_reason text,
    vendor_proof_url text
);


ALTER TABLE public."Transactions" OWNER TO postgres;

--
-- Name: Transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Transactions_id_seq" OWNER TO postgres;

--
-- Name: Transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transactions_id_seq" OWNED BY public."Transactions".id;


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    role character varying(255),
    kyc_status character varying(255),
    balance_ghs numeric,
    balance_cad numeric,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    kyc_document character varying(255),
    phone character varying(255),
    profile_picture character varying(255),
    country character varying(255),
    transaction_pin character varying(255),
    is_email_verified boolean DEFAULT false,
    verification_token character varying(255),
    reset_password_token character varying(255),
    reset_password_expires timestamp with time zone,
    verification_token_expires timestamp with time zone,
    kyc_document_type character varying(255),
    kyc_document_id character varying(255),
    kyc_front_url character varying(255),
    kyc_back_url character varying(255),
    is_online boolean DEFAULT false,
    is_active boolean DEFAULT true,
    account_number character varying(255),
    expo_push_token character varying(255),
    first_name character varying(255),
    middle_name character varying(255),
    last_name character varying(255),
    referral_code character varying(255),
    referred_by_id integer,
    deletion_requested_at timestamp with time zone,
    deletion_reason text,
    deactivation_reason text,
    two_factor_secret character varying(255),
    two_factor_enabled boolean DEFAULT false,
    sub_role character varying(255) DEFAULT 'super'::character varying,
    last_login timestamp with time zone
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Users_id_seq" OWNER TO postgres;

--
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- Name: AnnouncementDismissals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AnnouncementDismissals" ALTER COLUMN id SET DEFAULT nextval('public."AnnouncementDismissals_id_seq"'::regclass);


--
-- Name: Announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcements" ALTER COLUMN id SET DEFAULT nextval('public."Announcements_id_seq"'::regclass);


--
-- Name: AuditLogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLogs" ALTER COLUMN id SET DEFAULT nextval('public."AuditLogs_id_seq"'::regclass);


--
-- Name: Complaints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Complaints" ALTER COLUMN id SET DEFAULT nextval('public."Complaints_id_seq"'::regclass);


--
-- Name: Inquiries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inquiries" ALTER COLUMN id SET DEFAULT nextval('public."Inquiries_id_seq"'::regclass);


--
-- Name: Notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications" ALTER COLUMN id SET DEFAULT nextval('public."Notifications_id_seq"'::regclass);


--
-- Name: PaymentMethods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentMethods" ALTER COLUMN id SET DEFAULT nextval('public."PaymentMethods_id_seq"'::regclass);


--
-- Name: RateAlerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RateAlerts" ALTER COLUMN id SET DEFAULT nextval('public."RateAlerts_id_seq"'::regclass);


--
-- Name: Rates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rates" ALTER COLUMN id SET DEFAULT nextval('public."Rates_id_seq"'::regclass);


--
-- Name: Referrals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals" ALTER COLUMN id SET DEFAULT nextval('public."Referrals_id_seq"'::regclass);


--
-- Name: SystemConfigs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemConfigs" ALTER COLUMN id SET DEFAULT nextval('public."SystemConfigs_id_seq"'::regclass);


--
-- Name: Transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions" ALTER COLUMN id SET DEFAULT nextval('public."Transactions_id_seq"'::regclass);


--
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- Data for Name: AnnouncementDismissals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AnnouncementDismissals" (id, "announcementId", "userId", "createdAt", "updatedAt") FROM stdin;
1	2	19	2026-04-11 03:04:10.24+00	2026-04-11 03:04:10.24+00
\.


--
-- Data for Name: Announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Announcements" (id, title, message, type, target, is_active, expires_at, created_by, "createdAt", "updatedAt") FROM stdin;
1	mentenace	hwere we go bye logout	info	vendors	t	2026-04-12 00:00:00+00	2	2026-04-11 02:45:56.839+00	2026-04-11 02:45:56.839+00
2	maintenance	we good	warning	all	t	2026-04-12 00:00:00+00	2	2026-04-11 02:53:52.093+00	2026-04-11 02:53:52.093+00
\.


--
-- Data for Name: AuditLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLogs" (id, "userId", action, details, "ipAddress", "createdAt", "updatedAt") FROM stdin;
1	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-02-16 18:16:27.554+00	2026-02-16 18:16:27.554+00
2	18	LOGIN	User logged in: ama@vendor.com	::1	2026-02-16 18:20:15.407+00	2026-02-16 18:20:15.407+00
3	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-02-16 18:25:32.748+00	2026-02-16 18:25:32.748+00
4	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-02-16 19:59:10.163+00	2026-02-16 19:59:10.163+00
5	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-02-16 20:03:50.032+00	2026-02-16 20:03:50.032+00
6	14	TRANSACTION_CREATE	User created transaction 15 for 40 CAD	::1	2026-02-17 00:29:56.069+00	2026-02-17 00:29:56.069+00
7	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-02-17 11:37:42.876+00	2026-02-17 11:37:42.876+00
8	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 15	::1	2026-02-17 12:41:58.048+00	2026-02-17 12:41:58.048+00
9	14	TRANSACTION_CREATE	User created transaction 16 for 30 GHS	::1	2026-02-17 13:07:17.659+00	2026-02-17 13:07:17.659+00
10	14	TRANSACTION_CREATE	User created transaction 17 for 500 CAD	::1	2026-02-17 13:18:58.101+00	2026-02-17 13:18:58.101+00
11	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 17	::1	2026-02-17 13:19:22.443+00	2026-02-17 13:19:22.443+00
12	14	TRANSACTION_CREATE	User created transaction 18 for 300 GHS	::1	2026-02-17 13:38:08.491+00	2026-02-17 13:38:08.491+00
13	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 18	::1	2026-02-17 13:54:10.735+00	2026-02-17 13:54:10.735+00
14	18	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 18	::1	2026-02-17 13:54:25.504+00	2026-02-17 13:54:25.504+00
15	18	VENDOR_COMPLETE_TRANSACTION	Vendor marked transaction 18 as completed/sent	::1	2026-02-17 13:56:04.958+00	2026-02-17 13:56:04.958+00
16	14	TRANSACTION_CREATE	User created transaction 19 for 20 GHS	::1	2026-02-17 14:19:33.523+00	2026-02-17 14:19:33.523+00
17	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 19	::1	2026-02-17 14:20:09.045+00	2026-02-17 14:20:09.045+00
18	18	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 19	::1	2026-02-17 14:20:29.809+00	2026-02-17 14:20:29.809+00
19	18	VENDOR_COMPLETE_TRANSACTION	Vendor marked transaction 19 as completed/sent	::1	2026-02-17 14:20:41.693+00	2026-02-17 14:20:41.693+00
20	14	TRANSACTION_CREATE	User created transaction 20 for 40 CAD	::1	2026-02-17 14:39:13.096+00	2026-02-17 14:39:13.096+00
21	14	TRANSACTION_CREATE	User created transaction 21 for 66 GHS	::1	2026-02-17 19:14:53.472+00	2026-02-17 19:14:53.472+00
22	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-02-17 19:16:06.515+00	2026-02-17 19:16:06.515+00
23	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.156	2026-02-19 16:14:33.358+00	2026-02-19 16:14:33.358+00
24	14	TRANSACTION_CREATE	User created transaction 22 for 200 GHS	::ffff:192.168.79.156	2026-02-19 16:19:29.457+00	2026-02-19 16:19:29.457+00
25	14	TRANSACTION_CREATE	User created transaction 23 for 200 GHS	::ffff:192.168.79.156	2026-02-19 16:19:51.009+00	2026-02-19 16:19:51.009+00
26	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.156	2026-02-19 16:59:51.996+00	2026-02-19 16:59:51.996+00
27	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.156	2026-02-19 19:38:51.287+00	2026-02-19 19:38:51.287+00
28	14	TRANSACTION_CREATE	User created transaction 24 for 5 CAD	::ffff:192.168.79.156	2026-02-19 21:11:19.032+00	2026-02-19 21:11:19.032+00
29	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.156	2026-02-19 22:39:33.328+00	2026-02-19 22:39:33.328+00
30	14	TRANSACTION_CREATE	User created transaction 25 for 200 CAD	::ffff:192.168.79.156	2026-02-19 22:45:10.585+00	2026-02-19 22:45:10.585+00
31	14	TRANSACTION_CREATE	User created transaction 26 for 200 CAD	::ffff:192.168.79.156	2026-02-19 22:45:41.155+00	2026-02-19 22:45:41.155+00
32	14	TRANSACTION_CREATE	User created transaction 27 for 50 CAD	::ffff:192.168.79.156	2026-02-19 23:07:44.248+00	2026-02-19 23:07:44.248+00
33	14	TRANSACTION_CREATE	User created transaction 28 for 100 CAD	::ffff:192.168.79.156	2026-02-19 23:15:37.53+00	2026-02-19 23:15:37.53+00
34	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 28	::ffff:192.168.79.156	2026-02-19 23:16:19.476+00	2026-02-19 23:16:19.476+00
35	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-02-20 05:08:47.13+00	2026-02-20 05:08:47.13+00
36	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.155	2026-02-21 13:23:35.777+00	2026-02-21 13:23:35.777+00
37	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.155	2026-02-21 13:52:34.73+00	2026-02-21 13:52:34.73+00
38	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.155	2026-02-21 14:25:08.125+00	2026-02-21 14:25:08.125+00
39	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.79.155	2026-02-21 14:28:17.508+00	2026-02-21 14:28:17.508+00
68	22	REGISTER	User registered with email: tijanimoro@yahoo.com	::1	2026-02-28 17:46:26.502+00	2026-02-28 17:46:26.502+00
69	22	LOGIN	User logged in: tijanimoro@yahoo.com	::1	2026-02-28 17:46:42.427+00	2026-02-28 17:46:42.427+00
70	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-02-28 18:02:22.733+00	2026-02-28 18:02:22.733+00
71	22	LOGIN	User logged in: tijanimoro@yahoo.com	::1	2026-02-28 18:02:48.15+00	2026-02-28 18:02:48.15+00
72	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-02-28 18:02:59.269+00	2026-02-28 18:02:59.269+00
73	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-02-28 18:17:13.823+00	2026-02-28 18:17:13.823+00
74	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-02-28 18:58:39.832+00	2026-02-28 18:58:39.832+00
75	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-01 13:05:47.221+00	2026-03-01 13:05:47.221+00
76	14	TRANSACTION_CREATE	User created transaction 29 for 500 GHS	::ffff:192.168.0.137	2026-03-01 13:19:16.283+00	2026-03-01 13:19:16.283+00
77	14	TRANSACTION_CREATE	User created transaction 30 for 500 GHS	::ffff:192.168.0.137	2026-03-01 13:20:03.877+00	2026-03-01 13:20:03.877+00
78	22	LOGIN	User logged in: tijanimoro@yahoo.com	::ffff:192.168.0.137	2026-03-01 13:25:08.942+00	2026-03-01 13:25:08.942+00
79	22	TRANSACTION_CREATE	User created transaction 31 for 50 CAD	::ffff:192.168.0.137	2026-03-01 13:26:06.38+00	2026-03-01 13:26:06.38+00
80	22	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 31	::ffff:192.168.0.137	2026-03-01 13:27:49.592+00	2026-03-01 13:27:49.592+00
81	22	TRANSACTION_CREATE	User created transaction 32 for 55 CAD	::ffff:192.168.0.137	2026-03-01 13:31:12.883+00	2026-03-01 13:31:12.883+00
82	22	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 32	::ffff:192.168.0.137	2026-03-01 13:41:31.607+00	2026-03-01 13:41:31.607+00
83	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-01 18:55:26.337+00	2026-03-01 18:55:26.337+00
84	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-01 19:46:01.969+00	2026-03-01 19:46:01.969+00
85	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-02 00:25:17.54+00	2026-03-02 00:25:17.54+00
86	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 30	::ffff:192.168.0.137	2026-03-02 00:25:36.058+00	2026-03-02 00:25:36.058+00
87	14	TRANSACTION_CREATE	User created transaction 33 for 500 GHS	::ffff:192.168.0.137	2026-03-02 00:29:24.108+00	2026-03-02 00:29:24.108+00
88	14	TRANSACTION_CREATE	User created transaction 34 for 200 CAD	::ffff:192.168.0.137	2026-03-02 00:30:30.052+00	2026-03-02 00:30:30.052+00
89	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 33	::ffff:192.168.0.137	2026-03-02 00:46:44.983+00	2026-03-02 00:46:44.983+00
90	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-02 18:57:36.89+00	2026-03-02 18:57:36.89+00
91	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-06 18:57:17.737+00	2026-03-06 18:57:17.737+00
92	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-06 22:05:11.771+00	2026-03-06 22:05:11.771+00
93	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-06 22:06:23.787+00	2026-03-06 22:06:23.787+00
94	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-06 23:21:10.399+00	2026-03-06 23:21:10.399+00
95	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-11 15:51:14.863+00	2026-03-11 15:51:14.863+00
96	2	SUBMIT_INQUIRY	Contact form submission from ref@d.com. Subject: we good	::1	2026-03-11 16:55:46.832+00	2026-03-11 16:55:46.832+00
97	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-11 18:59:33.668+00	2026-03-11 18:59:33.668+00
98	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-11 20:07:12.817+00	2026-03-11 20:07:12.817+00
99	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-11 21:25:14.006+00	2026-03-11 21:25:14.006+00
100	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-11 21:25:47.953+00	2026-03-11 21:25:47.953+00
101	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-11 21:34:36.478+00	2026-03-11 21:34:36.478+00
102	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-11 21:35:23.567+00	2026-03-11 21:35:23.567+00
103	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-11 23:14:59.74+00	2026-03-11 23:14:59.74+00
104	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-12 04:12:46.574+00	2026-03-12 04:12:46.574+00
105	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-12 04:12:51.942+00	2026-03-12 04:12:51.942+00
106	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-12 04:12:54.308+00	2026-03-12 04:12:54.308+00
107	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-12 04:13:05.07+00	2026-03-12 04:13:05.07+00
108	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-12 04:21:08.959+00	2026-03-12 04:21:08.959+00
109	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-12 04:26:00.879+00	2026-03-12 04:26:00.879+00
110	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-12 04:26:28.592+00	2026-03-12 04:26:28.592+00
111	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-12 04:30:34.322+00	2026-03-12 04:30:34.322+00
112	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 34	::1	2026-03-12 04:32:43.351+00	2026-03-12 04:32:43.351+00
113	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-12 05:13:59.137+00	2026-03-12 05:13:59.137+00
114	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-12 05:15:17.703+00	2026-03-12 05:15:17.703+00
115	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-12 05:41:24.438+00	2026-03-12 05:41:24.438+00
116	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-12 17:38:50.064+00	2026-03-12 17:38:50.064+00
117	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-12 17:40:11.681+00	2026-03-12 17:40:11.681+00
118	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-12 20:08:20.696+00	2026-03-12 20:08:20.696+00
119	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-12 20:10:08.662+00	2026-03-12 20:10:08.662+00
120	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-12 20:10:45.311+00	2026-03-12 20:10:45.311+00
121	14	TRANSACTION_CANCEL	Transaction 29 cancelled by user	::1	2026-03-12 21:14:44.905+00	2026-03-12 21:14:44.905+00
122	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 27	::1	2026-03-13 03:43:19.322+00	2026-03-13 03:43:19.322+00
123	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 25	::1	2026-03-13 03:45:30.782+00	2026-03-13 03:45:30.782+00
124	14	TRANSACTION_CANCEL	Transaction 23 cancelled by user	::1	2026-03-13 03:49:09.788+00	2026-03-13 03:49:09.788+00
125	14	TRANSACTION_CANCEL	Transaction 16 cancelled by user	::1	2026-03-13 03:49:28.891+00	2026-03-13 03:49:28.891+00
126	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 21	::1	2026-03-13 03:49:47.822+00	2026-03-13 03:49:47.822+00
127	14	TRANSACTION_CANCEL	Transaction 22 cancelled by user	::1	2026-03-13 03:50:10.343+00	2026-03-13 03:50:10.343+00
128	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 26	::1	2026-03-13 03:55:33.166+00	2026-03-13 03:55:33.166+00
129	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-13 04:13:15.56+00	2026-03-13 04:13:15.56+00
130	21	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 33	::1	2026-03-13 04:14:13.048+00	2026-03-13 04:14:13.048+00
131	21	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 31	::1	2026-03-13 04:14:16.344+00	2026-03-13 04:14:16.344+00
132	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 04:15:19.195+00	2026-03-13 04:15:19.195+00
133	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-13 04:15:21.561+00	2026-03-13 04:15:21.561+00
134	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-13 04:15:51.561+00	2026-03-13 04:15:51.561+00
135	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-13 04:26:34.298+00	2026-03-13 04:26:34.298+00
136	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-13 04:26:51.787+00	2026-03-13 04:26:51.787+00
137	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-13 04:30:27.443+00	2026-03-13 04:30:27.443+00
138	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 27 to processing	::1	2026-03-13 04:31:25.193+00	2026-03-13 04:31:25.193+00
139	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 27 to sent	::1	2026-03-13 04:31:27.972+00	2026-03-13 04:31:27.972+00
140	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 21 to verified	::1	2026-03-13 04:32:16.782+00	2026-03-13 04:32:16.782+00
141	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 04:37:18.552+00	2026-03-13 04:37:18.552+00
142	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-03-13 04:41:55.708+00	2026-03-13 04:41:55.708+00
143	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-13 04:47:38.252+00	2026-03-13 04:47:38.252+00
144	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 04:48:12.221+00	2026-03-13 04:48:12.221+00
145	19	VENDOR_REJECT_TRANSACTION	Vendor rejected transaction 34. Reason: momo number issue	::1	2026-03-13 04:51:09.65+00	2026-03-13 04:51:09.65+00
146	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-13 04:52:38.29+00	2026-03-13 04:52:38.29+00
147	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 04:57:15.915+00	2026-03-13 04:57:15.915+00
148	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-13 04:59:07.728+00	2026-03-13 04:59:07.728+00
149	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 04:59:32.925+00	2026-03-13 04:59:32.925+00
150	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 28	::ffff:127.0.0.1	2026-03-13 05:20:18.112+00	2026-03-13 05:20:18.112+00
151	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 26	::1	2026-03-13 05:20:23.863+00	2026-03-13 05:20:23.863+00
152	19	VENDOR_COMPLETE_TRANSACTION	Vendor completed transaction 26 and uploaded proof.	::1	2026-03-13 05:45:36.949+00	2026-03-13 05:45:36.949+00
153	19	VENDOR_COMPLETE_TRANSACTION	Vendor completed transaction 28 and uploaded proof.	::1	2026-03-13 05:47:06.308+00	2026-03-13 05:47:06.308+00
154	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-13 05:57:01.979+00	2026-03-13 05:57:01.979+00
155	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-13 05:57:08.173+00	2026-03-13 05:57:08.173+00
156	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-13 05:59:54.745+00	2026-03-13 05:59:54.745+00
157	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 06:03:54.901+00	2026-03-13 06:03:54.901+00
158	19	VENDOR_COMPLETE_TRANSACTION	Vendor completed transaction 14 and uploaded proof.	::1	2026-03-13 06:04:13.55+00	2026-03-13 06:04:13.55+00
159	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 17	::1	2026-03-13 06:04:49.601+00	2026-03-13 06:04:49.601+00
160	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 15	::1	2026-03-13 06:04:54.613+00	2026-03-13 06:04:54.613+00
161	19	VENDOR_COMPLETE_TRANSACTION	Vendor completed transaction 15 and uploaded proof.	::1	2026-03-13 06:11:39.839+00	2026-03-13 06:11:39.839+00
162	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-13 06:13:19.939+00	2026-03-13 06:13:19.939+00
163	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 21:51:46.846+00	2026-03-13 21:51:46.846+00
164	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 25	::1	2026-03-13 21:53:36.754+00	2026-03-13 21:53:36.754+00
165	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-13 21:58:50.889+00	2026-03-13 21:58:50.889+00
166	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 22:22:05.491+00	2026-03-13 22:22:05.491+00
167	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-13 22:44:50.274+00	2026-03-13 22:44:50.274+00
168	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-13 22:46:31.957+00	2026-03-13 22:46:31.957+00
169	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-13 22:51:29.863+00	2026-03-13 22:51:29.863+00
170	21	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 21	::1	2026-03-13 22:58:02.498+00	2026-03-13 22:58:02.498+00
171	21	VENDOR_COMPLETE_TRANSACTION	Vendor sent transaction 21 and uploaded proof.	::1	2026-03-13 23:05:58.268+00	2026-03-13 23:05:58.268+00
172	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-14 04:15:54.634+00	2026-03-14 04:15:54.634+00
173	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-14 04:16:51.361+00	2026-03-14 04:16:51.361+00
174	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-17 15:23:35.535+00	2026-03-17 15:23:35.535+00
207	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-19 05:18:53.542+00	2026-03-19 05:18:53.542+00
208	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-22 13:37:07.126+00	2026-03-22 13:37:07.126+00
209	14	TRANSACTION_CREATE	User created transaction 35 for 3000 GHS	::1	2026-03-22 13:39:58.194+00	2026-03-22 13:39:58.194+00
210	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 35	::1	2026-03-22 13:43:22.179+00	2026-03-22 13:43:22.179+00
211	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-22 13:46:42.281+00	2026-03-22 13:46:42.281+00
212	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 32	::1	2026-03-22 13:47:52.864+00	2026-03-22 13:47:52.864+00
213	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-22 17:21:02.192+00	2026-03-22 17:21:02.192+00
214	14	TRANSACTION_CREATE	User created transaction 36 for 600 GHS	::1	2026-03-22 17:24:30.95+00	2026-03-22 17:24:30.95+00
215	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 36	::1	2026-03-22 17:26:08.231+00	2026-03-22 17:26:08.231+00
216	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-22 17:38:30.491+00	2026-03-22 17:38:30.491+00
217	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 24	::1	2026-03-22 17:40:07.358+00	2026-03-22 17:40:07.358+00
218	19	VENDOR_COMPLETE_TRANSACTION	Vendor sent transaction 25 and uploaded proof.	::1	2026-03-22 17:40:59.406+00	2026-03-22 17:40:59.406+00
219	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-22 17:41:31.005+00	2026-03-22 17:41:31.005+00
220	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-24 21:28:30.539+00	2026-03-24 21:28:30.539+00
221	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-25 15:11:52.565+00	2026-03-25 15:11:52.565+00
222	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-25 16:26:22.709+00	2026-03-25 16:26:22.709+00
223	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-25 16:54:59.352+00	2026-03-25 16:54:59.352+00
224	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-25 17:34:55.881+00	2026-03-25 17:34:55.881+00
225	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-25 17:35:08.597+00	2026-03-25 17:35:08.597+00
226	23	REGISTER	User registered with email: alhassan@gmail.com	::1	2026-03-25 18:17:08.366+00	2026-03-25 18:17:08.366+00
227	24	REGISTER	User registered with email: opoku@gmail.com	::1	2026-03-25 18:37:47.74+00	2026-03-25 18:37:47.74+00
228	24	LOGIN	User logged in: opoku@gmail.com	::1	2026-03-25 18:38:06.352+00	2026-03-25 18:38:06.352+00
229	25	REGISTER	User registered with email: kudus@gmail.com	::ffff:192.168.0.137	2026-03-25 18:46:57.492+00	2026-03-25 18:46:57.492+00
230	25	LOGIN	User logged in: kudus@gmail.com	::ffff:192.168.0.137	2026-03-25 18:47:24.384+00	2026-03-25 18:47:24.384+00
231	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-26 18:21:41.661+00	2026-03-26 18:21:41.661+00
232	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-27 12:21:21.689+00	2026-03-27 12:21:21.689+00
233	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-27 14:09:06.319+00	2026-03-27 14:09:06.319+00
234	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-27 14:17:13.123+00	2026-03-27 14:17:13.123+00
235	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-27 14:17:15.523+00	2026-03-27 14:17:15.523+00
236	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-03-27 14:17:56.912+00	2026-03-27 14:17:56.912+00
237	21	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 36	::1	2026-03-27 14:18:47.629+00	2026-03-27 14:18:47.629+00
238	21	VENDOR_COMPLETE_TRANSACTION	Vendor sent transaction 36 and uploaded proof.	::1	2026-03-27 14:19:59.982+00	2026-03-27 14:19:59.982+00
239	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-27 14:20:44.343+00	2026-03-27 14:20:44.343+00
240	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-28 15:55:12.998+00	2026-03-28 15:55:12.998+00
241	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-28 16:36:53.331+00	2026-03-28 16:36:53.331+00
242	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-29 14:48:11.669+00	2026-03-29 14:48:11.669+00
243	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-29 15:36:33.879+00	2026-03-29 15:36:33.879+00
244	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-29 15:54:18.008+00	2026-03-29 15:54:18.008+00
245	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-29 15:56:20.285+00	2026-03-29 15:56:20.285+00
246	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-29 16:21:22.569+00	2026-03-29 16:21:22.569+00
247	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-29 20:23:22.747+00	2026-03-29 20:23:22.747+00
248	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-29 20:23:56.781+00	2026-03-29 20:23:56.781+00
249	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-29 20:24:00.923+00	2026-03-29 20:24:00.923+00
250	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-29 20:24:02.416+00	2026-03-29 20:24:02.416+00
251	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-29 20:24:03.926+00	2026-03-29 20:24:03.926+00
252	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-29 20:24:04.925+00	2026-03-29 20:24:04.925+00
253	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-29 20:24:06.822+00	2026-03-29 20:24:06.822+00
254	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-29 20:24:08.063+00	2026-03-29 20:24:08.063+00
255	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-29 20:24:11.042+00	2026-03-29 20:24:11.042+00
256	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-29 20:24:18.999+00	2026-03-29 20:24:18.999+00
257	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-29 20:26:43.911+00	2026-03-29 20:26:43.911+00
258	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-03-29 20:55:03.667+00	2026-03-29 20:55:03.667+00
259	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-03-29 21:03:41.148+00	2026-03-29 21:03:41.148+00
260	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-29 21:52:43.568+00	2026-03-29 21:52:43.568+00
261	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-29 22:22:16.055+00	2026-03-29 22:22:16.055+00
262	19	VENDOR_ACCEPT_TRANSACTION	Vendor accepted transaction 34	::1	2026-03-29 22:27:55.9+00	2026-03-29 22:27:55.9+00
263	19	VENDOR_COMPLETE_TRANSACTION	Vendor sent transaction 34 and uploaded proof.	::1	2026-03-29 22:29:24.509+00	2026-03-29 22:29:24.509+00
264	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-29 22:30:18.39+00	2026-03-29 22:30:18.39+00
265	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-03-29 22:31:22.874+00	2026-03-29 22:31:22.874+00
266	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-03-30 18:32:38.901+00	2026-03-30 18:32:38.901+00
267	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-03-31 15:45:39.255+00	2026-03-31 15:45:39.255+00
268	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-02 04:20:47.835+00	2026-04-02 04:20:47.835+00
269	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-02 14:19:13.283+00	2026-04-02 14:19:13.283+00
270	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-04-02 14:30:35.461+00	2026-04-02 14:30:35.461+00
271	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.136	2026-04-02 23:30:10.085+00	2026-04-02 23:30:10.085+00
272	14	TRANSACTION_CREATE	User created transaction 37 for 500 CAD	::ffff:192.168.0.136	2026-04-02 23:33:54.56+00	2026-04-02 23:33:54.56+00
273	14	TRANSACTION_CREATE	User created transaction 38 for 500 CAD	::ffff:192.168.0.136	2026-04-02 23:34:14.834+00	2026-04-02 23:34:14.834+00
274	14	TRANSACTION_CREATE	User created transaction 39 for 500 CAD	::ffff:192.168.0.136	2026-04-02 23:34:32.774+00	2026-04-02 23:34:32.774+00
275	14	TRANSACTION_CREATE	User created transaction 40 for 500 CAD	::ffff:192.168.0.136	2026-04-02 23:36:10.124+00	2026-04-02 23:36:10.124+00
276	14	TRANSACTION_CREATE	User created transaction 41 for 500 CAD	::ffff:192.168.0.136	2026-04-02 23:36:43.128+00	2026-04-02 23:36:43.128+00
277	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.136	2026-04-03 18:47:24.947+00	2026-04-03 18:47:24.947+00
278	14	TRANSACTION_CREATE	User created transaction 42 for 350 CAD	::ffff:192.168.0.136	2026-04-03 18:51:49.975+00	2026-04-03 18:51:49.975+00
279	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-04-03 19:50:30.437+00	2026-04-03 19:50:30.437+00
280	14	TRANSACTION_CREATE	User created transaction 43 for 522 GHS	::ffff:192.168.0.137	2026-04-03 19:51:42.782+00	2026-04-03 19:51:42.782+00
281	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:192.168.0.137	2026-04-03 20:09:40.798+00	2026-04-03 20:09:40.798+00
282	14	TRANSACTION_CREATE	User created transaction 44 for 500 CAD	::ffff:192.168.0.137	2026-04-03 20:10:07.844+00	2026-04-03 20:10:07.844+00
283	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-04 18:12:31.918+00	2026-04-04 18:12:31.918+00
284	14	TRANSACTION_CREATE	User created transaction 45 for 500 GHS	::1	2026-04-04 18:15:24.654+00	2026-04-04 18:15:24.654+00
285	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 44	::1	2026-04-04 18:33:05.19+00	2026-04-04 18:33:05.19+00
286	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-06 00:16:39.918+00	2026-04-06 00:16:39.918+00
287	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-07 01:01:49.137+00	2026-04-07 01:01:49.137+00
288	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 45 to processing	::1	2026-04-07 01:03:21.196+00	2026-04-07 01:03:21.196+00
289	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 44 to processing	::1	2026-04-07 01:03:31.319+00	2026-04-07 01:03:31.319+00
290	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 45 to sent	::1	2026-04-07 01:04:12.294+00	2026-04-07 01:04:12.294+00
291	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-07 01:24:16.638+00	2026-04-07 01:24:16.638+00
292	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-07 01:26:45.521+00	2026-04-07 01:26:45.521+00
293	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-04-07 01:45:28.079+00	2026-04-07 01:45:28.079+00
294	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-04-07 01:51:59.086+00	2026-04-07 01:51:59.086+00
295	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-04-07 01:53:48.744+00	2026-04-07 01:53:48.744+00
296	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-04-07 01:53:55.714+00	2026-04-07 01:53:55.714+00
297	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-04-07 02:00:09.869+00	2026-04-07 02:00:09.869+00
298	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-04-07 02:03:04.843+00	2026-04-07 02:03:04.843+00
299	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-07 02:35:39.118+00	2026-04-07 02:35:39.118+00
300	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to offline	::1	2026-04-07 02:38:38.421+00	2026-04-07 02:38:38.421+00
301	19	VENDOR_TOGGLE_ONLINE	Vendor 19 toggled status to online	::1	2026-04-07 02:38:42.904+00	2026-04-07 02:38:42.904+00
302	18	LOGIN	User logged in: ama@vendor.com	::1	2026-04-07 02:51:24.167+00	2026-04-07 02:51:24.167+00
303	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-04-07 03:37:51.815+00	2026-04-07 03:37:51.815+00
304	18	LOGIN	User logged in: ama@vendor.com	::1	2026-04-07 03:38:18.377+00	2026-04-07 03:38:18.377+00
305	21	LOGIN	User logged in: milco.vendor@qwiktransfer.com	::1	2026-04-07 03:38:37.747+00	2026-04-07 03:38:37.747+00
306	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:127.0.0.1	2026-04-07 03:47:47.071+00	2026-04-07 03:47:47.071+00
307	14	TRANSACTION_CREATE	User created transaction 46 for 200 GHS	::ffff:127.0.0.1	2026-04-07 03:48:10.861+00	2026-04-07 03:48:10.861+00
308	14	TRANSACTION_CREATE	User created transaction 47 for 67 CAD	::ffff:127.0.0.1	2026-04-07 03:52:55.338+00	2026-04-07 03:52:55.338+00
309	14	TRANSACTION_CREATE	User created transaction 48 for 98 GHS	::ffff:127.0.0.1	2026-04-07 04:10:07.267+00	2026-04-07 04:10:07.267+00
310	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 46 to processing	::1	2026-04-07 04:39:28.545+00	2026-04-07 04:39:28.545+00
311	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 47 to processing	::1	2026-04-07 04:39:28.578+00	2026-04-07 04:39:28.578+00
312	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-08 01:35:50.251+00	2026-04-08 01:35:50.251+00
313	2	REASSIGN_VENDOR	Admin reassigned transaction 48 from None to vendor 21	::1	2026-04-08 01:36:24.293+00	2026-04-08 01:36:24.293+00
314	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 41 to processing	::1	2026-04-08 01:37:09.128+00	2026-04-08 01:37:09.128+00
315	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 41 to processing	::1	2026-04-08 01:37:09.201+00	2026-04-08 01:37:09.201+00
316	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 41 to processing	::1	2026-04-08 01:37:10.103+00	2026-04-08 01:37:10.103+00
317	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 41 to processing	::1	2026-04-08 01:37:10.819+00	2026-04-08 01:37:10.819+00
318	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 43 to processing	::1	2026-04-08 01:41:52.523+00	2026-04-08 01:41:52.523+00
319	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 41	::1	2026-04-08 01:42:45.756+00	2026-04-08 01:42:45.756+00
320	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 41	::1	2026-04-08 01:42:47.896+00	2026-04-08 01:42:47.896+00
321	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 41	::1	2026-04-08 01:42:58.283+00	2026-04-08 01:42:58.283+00
322	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 41	::1	2026-04-08 01:43:52.852+00	2026-04-08 01:43:52.852+00
323	2	ADMIN_FORCE_CONFIRM	Admin changed status of transaction 41 to sent	::1	2026-04-08 01:43:54.846+00	2026-04-08 01:43:54.846+00
324	2	REASSIGN_VENDOR	Admin reassigned transaction 47 from None to vendor 21	::1	2026-04-08 01:44:20.984+00	2026-04-08 01:44:20.984+00
325	2	REASSIGN_VENDOR	Admin reassigned transaction 46 from None to vendor 21	::1	2026-04-08 02:00:43.43+00	2026-04-08 02:00:43.43+00
326	2	TRANSACTION_STATUS_CHANGE	Admin changed status of transaction 40 to processing	::1	2026-04-08 02:44:11.618+00	2026-04-08 02:44:11.618+00
327	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 40	::1	2026-04-08 02:44:46.534+00	2026-04-08 02:44:46.534+00
328	2	ADMIN_FORCE_CONFIRM	Admin changed status of transaction 40 to sent	::1	2026-04-08 02:44:47.824+00	2026-04-08 02:44:47.824+00
329	2	REASSIGN_VENDOR	Admin reassigned transaction 41 from None to vendor 19	::1	2026-04-08 02:45:16.691+00	2026-04-08 02:45:16.691+00
330	2	REASSIGN_VENDOR	Admin reassigned transaction 11 from None to vendor 19	::1	2026-04-08 02:49:30.214+00	2026-04-08 02:49:30.214+00
331	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 10	::1	2026-04-08 02:49:46.359+00	2026-04-08 02:49:46.359+00
332	2	ADMIN_FORCE_CONFIRM	Admin changed status of transaction 10 to sent	::1	2026-04-08 02:49:48.167+00	2026-04-08 02:49:48.167+00
333	2	UPDATE_RATE_SETTINGS	Admin updated rate settings: API=true, Manual Rate=8.80, Spread=5.00%	::1	2026-04-08 03:21:40.962+00	2026-04-08 03:21:40.962+00
334	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: rate_lock_time = 20	::1	2026-04-08 03:21:41.159+00	2026-04-08 03:21:41.159+00
335	2	UPDATE_RATE_SETTINGS	Admin updated rate settings: API=false, Manual Rate=8.80, Spread=5.00%	::1	2026-04-08 03:22:37.988+00	2026-04-08 03:22:37.988+00
336	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-09 01:37:59.821+00	2026-04-09 01:37:59.821+00
337	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:127.0.0.1	2026-04-09 01:45:48.648+00	2026-04-09 01:45:48.648+00
338	14	TRANSACTION_CREATE	User created transaction 49 for 500 GHS	::ffff:127.0.0.1	2026-04-09 01:46:31.009+00	2026-04-09 01:46:31.009+00
339	14	TRANSACTION_CREATE	User created transaction 50 for 78 CAD	::ffff:127.0.0.1	2026-04-09 02:15:23.33+00	2026-04-09 02:15:23.33+00
340	2	UPDATE_RATE_SETTINGS	Admin updated rate settings: API=true, Manual Rate=8.80, Spread=5.00%	::1	2026-04-09 02:33:31.271+00	2026-04-09 02:33:31.271+00
341	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: rate_lock_time = 20	::1	2026-04-09 02:33:31.306+00	2026-04-09 02:33:31.306+00
342	14	TRANSACTION_CREATE	User created transaction 51 for 700 CAD	::ffff:127.0.0.1	2026-04-09 02:34:01.988+00	2026-04-09 02:34:01.988+00
343	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-10 22:47:50.084+00	2026-04-10 22:47:50.084+00
344	2	ENABLE_2FA	Setup and enabled 2FA successfully	::1	2026-04-10 22:49:10.711+00	2026-04-10 22:49:10.711+00
345	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-10 22:50:27.043+00	2026-04-10 22:50:27.043+00
346	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 20 to verified	::1	2026-04-10 23:05:40.199+00	2026-04-10 23:05:40.199+00
347	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 4 to verified	::1	2026-04-10 23:25:39.784+00	2026-04-10 23:25:39.784+00
348	2	CREATE_ADMIN	Admin created staff: nuru.admin@qwiktransfers.com (support)	::1	2026-04-11 00:55:47.922+00	2026-04-11 00:55:47.922+00
349	26	LOGIN	User logged in: nuru.admin@qwiktransfers.com	::1	2026-04-11 00:55:58.55+00	2026-04-11 00:55:58.55+00
350	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-11 00:57:18.097+00	2026-04-11 00:57:18.097+00
351	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::1	2026-04-11 02:46:25.765+00	2026-04-11 02:46:25.765+00
352	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::ffff:127.0.0.1	2026-04-11 02:49:24.209+00	2026-04-11 02:49:24.209+00
353	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-11 02:51:22.696+00	2026-04-11 02:51:22.696+00
354	14	LOGIN	User logged in: tjhackx111@gmail.com	::ffff:127.0.0.1	2026-04-11 02:56:52.699+00	2026-04-11 02:56:52.699+00
355	19	LOGIN	User logged in: ama.vendor@qwiktransfers.com	::ffff:127.0.0.1	2026-04-11 03:03:53.276+00	2026-04-11 03:03:53.276+00
356	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-12 01:43:52.794+00	2026-04-12 01:43:52.794+00
357	14	TRANSACTION_CREATE	User created transaction 52 for 78 GHS	::1	2026-04-12 02:15:06.488+00	2026-04-12 02:15:06.488+00
358	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 52	::1	2026-04-12 02:18:39.041+00	2026-04-12 02:18:39.041+00
359	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 50	::1	2026-04-12 02:24:05.496+00	2026-04-12 02:24:05.496+00
360	14	TRANSACTION_CREATE	User created transaction 53 for 50 GHS	::1	2026-04-12 02:30:06.666+00	2026-04-12 02:30:06.666+00
361	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 53	::1	2026-04-12 02:30:27.191+00	2026-04-12 02:30:27.191+00
362	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-12 02:34:38.764+00	2026-04-12 02:34:38.764+00
363	14	TRANSACTION_CREATE	User created transaction 54 for 123 GHS	::1	2026-04-12 03:49:41.048+00	2026-04-12 03:49:41.048+00
364	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-13 09:31:05.931+00	2026-04-13 09:31:05.931+00
365	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-14 00:28:35.741+00	2026-04-14 00:28:35.741+00
366	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-14 00:33:21.732+00	2026-04-14 00:33:21.732+00
367	14	TRANSACTION_CREATE	User created transaction 55 for 55 GHS	::1	2026-04-14 01:36:46.557+00	2026-04-14 01:36:46.557+00
368	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 55	::1	2026-04-14 01:42:25.907+00	2026-04-14 01:42:25.907+00
369	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 55	::1	2026-04-14 01:42:48.858+00	2026-04-14 01:42:48.858+00
370	14	TRANSACTION_CREATE	User created transaction 56 for 89 CAD	::1	2026-04-14 02:00:40.815+00	2026-04-14 02:00:40.815+00
371	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 56	::1	2026-04-14 02:01:30.409+00	2026-04-14 02:01:30.409+00
372	14	TRANSACTION_CREATE	User created transaction 57 for 890 GHS	::1	2026-04-14 02:17:11.316+00	2026-04-14 02:17:11.316+00
373	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 57	::1	2026-04-14 02:18:13.567+00	2026-04-14 02:18:13.567+00
374	14	TRANSACTION_CREATE	User created transaction 58 for 120 CAD	::1	2026-04-14 02:24:08.855+00	2026-04-14 02:24:08.855+00
375	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 58	::1	2026-04-14 02:24:32.812+00	2026-04-14 02:24:32.812+00
376	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-14 03:10:10.682+00	2026-04-14 03:10:10.682+00
377	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-14 03:11:00.666+00	2026-04-14 03:11:00.666+00
378	14	TRANSACTION_CREATE	User created transaction 59 for 78 CAD	::1	2026-04-14 04:27:51.695+00	2026-04-14 04:27:51.695+00
379	14	TRANSACTION_PROOF_UPLOAD	User uploaded proof for transaction 59	::1	2026-04-14 04:28:12.697+00	2026-04-14 04:28:12.697+00
380	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-14 04:41:49.559+00	2026-04-14 04:41:49.559+00
381	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: system_address = 	::1	2026-04-14 05:33:11.031+00	2026-04-14 05:33:11.031+00
384	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: system_contact = 	::1	2026-04-14 05:33:11.04+00	2026-04-14 05:33:11.04+00
383	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: system_email = info@qwiktransfers.com	::1	2026-04-14 05:33:11.037+00	2026-04-14 05:33:11.037+00
382	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: system_name = 	::1	2026-04-14 05:33:11.035+00	2026-04-14 05:33:11.035+00
385	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: system_name = QwikTransfers	::1	2026-04-14 05:45:45.302+00	2026-04-14 05:45:45.302+00
386	14	LOGIN	User logged in: tjhackx111@gmail.com	::1	2026-04-17 14:39:58.48+00	2026-04-17 14:39:58.48+00
387	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-17 15:02:12.196+00	2026-04-17 15:02:12.196+00
388	\N	SUBMIT_INQUIRY	Contact form submission from f@wfw.com. Subject: wejkn	::1	2026-04-17 17:58:11.045+00	2026-04-17 17:58:11.045+00
389	\N	SUBMIT_INQUIRY	Contact form submission from h@de.com. Subject: jkwefn	::1	2026-04-17 17:58:24.1+00	2026-04-17 17:58:24.1+00
390	\N	SUBMIT_INQUIRY	Contact form submission from fe@kjewfn.com. Subject: jknf	::1	2026-04-17 17:58:43.102+00	2026-04-17 17:58:43.102+00
391	\N	SUBMIT_INQUIRY	Contact form submission from w@ee.com. Subject: jkfn	::1	2026-04-17 17:59:23.856+00	2026-04-17 17:59:23.856+00
419	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 25 to verified	::1	2026-04-18 03:18:08.921+00	2026-04-18 03:18:08.921+00
420	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 25 to verified	::1	2026-04-18 03:18:14.437+00	2026-04-18 03:18:14.437+00
421	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 25 to rejected	::1	2026-04-18 03:18:18.168+00	2026-04-18 03:18:18.168+00
422	2	UPDATE_KYC_STATUS	Admin updated KYC status for user 25 to verified	::1	2026-04-18 03:18:23.725+00	2026-04-18 03:18:23.725+00
423	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-18 03:53:50.966+00	2026-04-18 03:53:50.966+00
424	2	TOGGLE_USER_STATUS	Admin disabled account for user 14	::1	2026-04-18 03:54:22.299+00	2026-04-18 03:54:22.299+00
425	2	LOGIN	User logged in: admin@qwiktransfers.com	::1	2026-04-18 03:55:11.608+00	2026-04-18 03:55:11.608+00
426	2	TOGGLE_USER_STATUS	Admin enabled account for user 14	::1	2026-04-18 03:55:22.498+00	2026-04-18 03:55:22.498+00
427	2	UPDATE_USER_REGION	Admin updated region for user 21 to Ghana	::1	2026-04-18 04:04:13.058+00	2026-04-18 04:04:13.058+00
428	2	UPDATE_USER_REGION	Admin updated region for user 21 to All	::1	2026-04-18 04:04:17.304+00	2026-04-18 04:04:17.304+00
429	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 19:01:59.973+00	2026-04-18 19:01:59.973+00
430	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 19:02:02.473+00	2026-04-18 19:02:02.473+00
431	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 19:02:03.459+00	2026-04-18 19:02:03.459+00
432	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 19:02:22.532+00	2026-04-18 19:02:22.532+00
433	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 19:02:25.161+00	2026-04-18 19:02:25.161+00
434	2	TOGGLE_USER_STATUS	Admin disabled account for user 26	::1	2026-04-18 20:57:02.824+00	2026-04-18 20:57:02.824+00
435	2	TOGGLE_USER_STATUS	Admin enabled account for user 26	::1	2026-04-18 20:57:13.445+00	2026-04-18 20:57:13.445+00
436	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 20:57:21.091+00	2026-04-18 20:57:21.091+00
437	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 20:57:31.251+00	2026-04-18 20:57:31.251+00
438	2	UPDATE_USER_ROLE	Admin updated role for user 26 to undefined	::1	2026-04-18 20:57:36.305+00	2026-04-18 20:57:36.305+00
439	2	UPDATE_RATE_SETTINGS	Admin updated rate settings: API=false, Manual Rate=8.9, Spread=5.00%	::1	2026-04-19 00:29:04.994+00	2026-04-19 00:29:04.994+00
440	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: tiered_limits = {"level1":600,"level2":5000,"level3":50000}	::1	2026-04-19 00:29:14.767+00	2026-04-19 00:29:14.767+00
441	2	UPDATE_PAYMENT_METHOD	Admin updated payment method: momo-ghs (GHS)	::1	2026-04-19 00:29:20.043+00	2026-04-19 00:29:20.043+00
442	2	UPDATE_PAYMENT_METHOD	Admin updated payment method: momo-ghs (GHS)	::1	2026-04-19 00:29:30.528+00	2026-04-19 00:29:30.528+00
443	2	UPDATE_SYSTEM_CONFIG	Admin updated system config: system_name = QwikTransfers | Welcome	::1	2026-04-19 00:29:45.716+00	2026-04-19 00:29:45.716+00
\.


--
-- Data for Name: Complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Complaints" (id, user_id, transaction_id, subject, description, status, attachment_url, admin_response, "createdAt", "updatedAt") FROM stdin;
2	14	\N	test 1	deatails 2	open	/uploads/attachment-1774444141825-155262525.png	\N	2026-03-25 13:09:01.901+00	2026-03-25 13:09:01.901+00
3	14	\N	sunnn	providing	closed	/uploads/attachment-1774445580769-774547366.png	Issue cancelled by user.	2026-03-25 13:33:00.928+00	2026-03-25 17:03:36.914+00
1	14	29	good news.	description 123	closed	\N	Issue cancelled by user.	2026-03-25 12:37:26.125+00	2026-03-25 17:05:17.506+00
6	19	\N	vendor test 1	vhim vhim	open	\N	\N	2026-03-29 21:51:17.428+00	2026-03-29 21:51:17.428+00
7	14	41	Failed Transaction for unknown reasons 	I have been trying to send 1,000Ghs but I keep getting error.	open	/uploads/attachment-1774823455090-539379375.pdf	\N	2026-03-29 22:30:55.099+00	2026-04-03 18:49:15.221+00
5	14	5	Wrong Transaction 	I have made a wrong transaction can you assist me with reversal	open	/uploads/attachment-1774456254934-895822519.jpg	\N	2026-03-25 16:30:55.223+00	2026-04-03 18:50:21.051+00
4	14	33	wfw1-2-3-4-5	Description my des	resolved	/uploads/attachment-1774448044721-338116776.png	some small	2026-03-25 13:35:29.121+00	2026-04-18 03:01:36.051+00
\.


--
-- Data for Name: Inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inquiries" (id, full_name, email, subject, message, status, "createdAt", "updatedAt") FROM stdin;
1	Tijani Moro	ref@d.com	we good	bla bla bla	replied	2026-03-11 16:55:46.717+00	2026-03-11 19:11:07.887+00
2	kofi	f@wfw.com	wejkn	jkwnf wekfjnew fewkf wefkjn	pending	2026-04-17 17:58:10.998+00	2026-04-17 17:58:10.998+00
5	weedat	w@ee.com	jkfn	 wejfnew ewfunwef 	pending	2026-04-17 17:59:23.778+00	2026-04-17 17:59:23.778+00
3	hmaza	h@de.com	jkwefn	kwnf ewfjwef ewf ewf 	closed	2026-04-17 17:58:24.035+00	2026-04-17 18:06:57.039+00
4	gorge	fe@kjewfn.com	jknf	kjwnfw fwef ewf	replied	2026-04-17 17:58:43.029+00	2026-04-17 18:07:15.517+00
\.


--
-- Data for Name: Notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notifications" (id, "userId", type, message, "isRead", "createdAt", "updatedAt", link) FROM stdin;
1	14	TRANSACTION_UPDATE	Proof of payment for transaction #15 has been uploaded and is pending verification.	t	2026-02-17 12:41:58.073+00	2026-02-17 12:43:01.754+00	\N
16	14	TRANSACTION_UPDATE	Transaction of 66 GHS initiated. Your rate is locked for 15 minutes.	t	2026-02-17 19:14:58.257+00	2026-02-19 16:18:10.782+00	\N
19	14	TRANSACTION_UPDATE	Transaction of 5 CAD initiated. Your rate is locked for 15 minutes.	t	2026-02-19 21:11:24.229+00	2026-02-19 21:15:09.546+00	\N
23	14	TRANSACTION_UPDATE	Transaction of 100 CAD initiated. Your rate is locked for 15 minutes.	t	2026-02-19 23:15:41.375+00	2026-02-21 13:41:32.213+00	\N
22	14	TRANSACTION_UPDATE	Transaction of 50 CAD initiated. Your rate is locked for 15 minutes.	t	2026-02-19 23:07:48.267+00	2026-02-21 13:41:32.44+00	\N
21	14	TRANSACTION_UPDATE	Transaction of 200 CAD initiated. Your rate is locked for 15 minutes.	t	2026-02-19 22:45:43.504+00	2026-02-21 13:41:34.177+00	\N
20	14	TRANSACTION_UPDATE	Transaction of 200 CAD initiated. Your rate is locked for 15 minutes.	t	2026-02-19 22:45:21.314+00	2026-02-21 13:41:35.855+00	\N
24	14	TRANSACTION_UPDATE	Proof of payment for transaction #28 has been uploaded and is pending verification.	t	2026-02-19 23:16:19.485+00	2026-02-21 13:41:37.666+00	\N
25	14	RATE_ALERT	Rate Watcher Set: We will notify you when 1 CAD reaches 8.60 GHS (above).	t	2026-02-20 05:14:21.024+00	2026-02-21 13:43:42.093+00	\N
5	14	TRANSACTION_UPDATE	Proof of payment for transaction #17 has been uploaded and is pending verification.	t	2026-02-17 13:19:22.452+00	2026-02-21 14:30:37.266+00	\N
60	22	TRANSACTION_UPDATE	Transaction of 50 CAD initiated. Your rate is locked for 15 minutes.	f	2026-03-01 13:26:09.395+00	2026-03-01 13:26:09.395+00	\N
61	22	TRANSACTION_UPDATE	Proof of payment for transaction #31 has been uploaded and is pending verification.	f	2026-03-01 13:27:49.602+00	2026-03-01 13:27:49.602+00	\N
62	22	TRANSACTION_UPDATE	Transaction of 55 CAD initiated. Your rate is locked for 15 minutes.	f	2026-03-01 13:31:15.926+00	2026-03-01 13:31:15.926+00	\N
63	22	TRANSACTION_UPDATE	Proof of payment for transaction #32 has been uploaded and is pending verification.	f	2026-03-01 13:41:31.618+00	2026-03-01 13:41:31.618+00	\N
64	14	TRANSACTION_UPDATE	Proof of payment for transaction #30 has been uploaded and is pending verification.	t	2026-03-02 00:25:36.065+00	2026-03-12 20:11:42.401+00	\N
72	14	TRANSACTION_UPDATE	Proof of payment for transaction #26 has been uploaded and is pending verification.	t	2026-03-13 03:55:33.197+00	2026-03-13 03:58:39.89+00	\N
71	14	TRANSACTION_UPDATE	Proof of payment for transaction #21 has been uploaded and is pending verification.	t	2026-03-13 03:49:47.826+00	2026-03-13 03:58:41.111+00	\N
2	14	RATE_ALERT	Rate Watcher Set: We will notify you when 1 CAD reaches 10.00 GHS (above).	t	2026-02-17 12:55:44.549+00	2026-03-13 03:58:44.015+00	\N
3	14	RATE_ALERT	Rate Watcher Set: We will notify you when 1 CAD reaches 20.00 GHS (above).	t	2026-02-17 12:56:54.989+00	2026-03-13 03:58:44.015+00	\N
4	14	RATE_ALERT	Rate Watcher Set: We will notify you when 1 CAD reaches 7.00 GHS (above).	t	2026-02-17 13:05:56.602+00	2026-03-13 03:58:44.015+00	\N
6	14	RATE_ALERT	Rate Alert: The CAD to GHS rate is now 8.09. This matches your target of 7.00 (above).	t	2026-02-17 13:34:01.699+00	2026-03-13 03:58:44.015+00	\N
7	14	TRANSACTION_UPDATE	Transaction of 300 GHS initiated. Your rate is locked for 15 minutes.	t	2026-02-17 13:38:11.238+00	2026-03-13 03:58:44.015+00	\N
8	14	TRANSACTION_UPDATE	Proof of payment for transaction #18 has been uploaded and is pending verification.	t	2026-02-17 13:54:10.753+00	2026-03-13 03:58:44.015+00	\N
9	14	TRANSACTION_UPDATE	Your transaction #18 has been accepted by a vendor and is being processed.	t	2026-02-17 13:54:25.731+00	2026-03-13 03:58:44.015+00	\N
10	14	TRANSACTION_UPDATE	Good news! Your transaction #18 has been fully processed and sent to the recipient.	t	2026-02-17 13:56:04.961+00	2026-03-13 03:58:44.015+00	\N
11	14	TRANSACTION_UPDATE	Transaction of 20 GHS initiated. Your rate is locked for 15 minutes.	t	2026-02-17 14:19:37.517+00	2026-03-13 03:58:44.015+00	\N
12	14	TRANSACTION_UPDATE	Proof of payment for transaction #19 has been uploaded and is pending verification.	t	2026-02-17 14:20:09.057+00	2026-03-13 03:58:44.015+00	\N
13	14	TRANSACTION_UPDATE	Your transaction #19 has been accepted by a vendor and is being processed.	t	2026-02-17 14:20:29.819+00	2026-03-13 03:58:44.015+00	\N
14	14	TRANSACTION_UPDATE	Good news! Your transaction #19 has been fully processed and sent to the recipient.	t	2026-02-17 14:20:41.729+00	2026-03-13 03:58:44.015+00	\N
15	14	TRANSACTION_UPDATE	Transaction of 40 CAD initiated. Your rate is locked for 15 minutes.	t	2026-02-17 14:39:17.697+00	2026-03-13 03:58:44.015+00	\N
17	14	TRANSACTION_UPDATE	Transaction of 200 GHS initiated. Your rate is locked for 15 minutes.	t	2026-02-19 16:19:40.532+00	2026-03-13 03:58:44.015+00	\N
18	14	TRANSACTION_UPDATE	Transaction of 200 GHS initiated. Your rate is locked for 15 minutes.	t	2026-02-19 16:20:00.444+00	2026-03-13 03:58:44.015+00	\N
58	14	TRANSACTION_UPDATE	Transaction of 500 GHS initiated. Your rate is locked for 15 minutes.	t	2026-03-01 13:19:27.368+00	2026-03-13 03:58:44.015+00	\N
59	14	TRANSACTION_UPDATE	Transaction of 500 GHS initiated. Your rate is locked for 15 minutes.	t	2026-03-01 13:20:06.304+00	2026-03-13 03:58:44.015+00	\N
65	14	TRANSACTION_UPDATE	Transaction of 500 GHS initiated. Your rate is locked for 15 minutes.	t	2026-03-02 00:29:28.418+00	2026-03-13 03:58:44.015+00	\N
66	14	TRANSACTION_UPDATE	Transaction of 200 CAD initiated. Your rate is locked for 15 minutes.	t	2026-03-02 00:30:36.557+00	2026-03-13 03:58:44.015+00	\N
67	14	TRANSACTION_UPDATE	Proof of payment for transaction #33 has been uploaded and is pending verification.	t	2026-03-02 00:46:45.012+00	2026-03-13 03:58:44.015+00	\N
68	14	TRANSACTION_UPDATE	Your transaction #34 has been accepted by a vendor and is being processed.	t	2026-03-12 04:32:43.456+00	2026-03-13 03:58:44.015+00	\N
69	14	TRANSACTION_UPDATE	Proof of payment for transaction #27 has been uploaded and is pending verification.	t	2026-03-13 03:43:19.342+00	2026-03-13 03:58:44.015+00	\N
70	14	TRANSACTION_UPDATE	Proof of payment for transaction #25 has been uploaded and is pending verification.	t	2026-03-13 03:45:30.795+00	2026-03-13 03:58:44.015+00	\N
74	22	TRANSACTION_UPDATE	Your transaction #31 has been accepted by a vendor and is being processed.	f	2026-03-13 04:14:16.347+00	2026-03-13 04:14:16.347+00	\N
77	14	TRANSACTION_UPDATE	Your transaction #34 was returned to the pool by the vendor. Reason: momo number issue	t	2026-03-13 04:51:09.658+00	2026-03-13 04:59:23.849+00	\N
82	20	TRANSACTION_COMPLETE	Your transaction #14 has been completed! You can view the payment proof in your dashboard.	f	2026-03-13 06:04:13.556+00	2026-03-13 06:04:13.556+00	\N
91	22	TRANSACTION_UPDATE	Your transaction #32 has been accepted by a vendor and is being processed.	f	2026-03-22 13:47:53.08+00	2026-03-22 13:47:53.08+00	\N
96	2	complaint	New complaint filed by user Tijani Moro. Subject: Goof	f	2026-03-25 16:30:55.465+00	2026-03-25 16:30:55.465+00	\N
73	14	TRANSACTION_UPDATE	Your transaction #33 has been accepted by a vendor and is being processed.	t	2026-03-13 04:14:13.1+00	2026-03-27 12:43:22.28+00	\N
75	14	TRANSACTION_UPDATE	Your transaction #27 status has been updated to PROCESSING.	t	2026-03-13 04:31:25.199+00	2026-03-27 12:43:23.5+00	\N
76	14	TRANSACTION_UPDATE	Your transaction #27 status has been updated to SENT.	t	2026-03-13 04:31:27.98+00	2026-03-27 12:43:25.725+00	\N
78	14	TRANSACTION_UPDATE	Your transaction #28 has been accepted by a vendor and is being processed.	t	2026-03-13 05:20:18.498+00	2026-03-27 12:43:29.116+00	\N
94	14	TRANSACTION_UPDATE	Your transaction #24 has been accepted by a vendor and is being processed.	t	2026-03-22 17:40:07.727+00	2026-03-27 12:43:37.492+00	\N
89	14	TRANSACTION_UPDATE	Transaction of 3000 GHS initiated. Your rate is locked for 15 minutes.	t	2026-03-22 13:40:07.327+00	2026-03-27 13:45:34.245+00	\N
95	14	TRANSACTION_COMPLETE	Your transaction #25 has been completed! You can view the payment proof in your dashboard.	t	2026-03-22 17:40:59.426+00	2026-03-27 15:21:55.073+00	\N
98	14	TRANSACTION_COMPLETE	Your transaction #36 has been completed! You can view the payment proof in your dashboard.	t	2026-03-27 14:19:59.994+00	2026-03-27 15:21:55.773+00	\N
97	14	TRANSACTION_UPDATE	Your transaction #36 has been accepted by a vendor and is being processed.	t	2026-03-27 14:18:47.898+00	2026-03-27 15:21:56.387+00	\N
92	14	TRANSACTION_UPDATE	Transaction of 600 GHS initiated. Your rate is locked for 15 minutes.	t	2026-03-22 17:24:36.672+00	2026-03-27 15:21:58.245+00	\N
93	14	TRANSACTION_UPDATE	Proof of payment for transaction #36 has been uploaded and is pending verification.	t	2026-03-22 17:26:08.254+00	2026-03-27 15:21:58.59+00	\N
79	14	TRANSACTION_UPDATE	Your transaction #26 has been accepted by a vendor and is being processed.	t	2026-03-13 05:20:23.867+00	2026-03-27 15:22:06.299+00	\N
80	14	TRANSACTION_COMPLETE	Your transaction #26 has been completed! You can view the payment proof in your dashboard.	t	2026-03-13 05:45:36.966+00	2026-03-27 15:22:06.689+00	\N
81	14	TRANSACTION_COMPLETE	Your transaction #28 has been completed! You can view the payment proof in your dashboard.	t	2026-03-13 05:47:06.313+00	2026-03-27 15:22:07.071+00	\N
83	14	TRANSACTION_UPDATE	Your transaction #17 has been accepted by a vendor and is being processed.	t	2026-03-13 06:04:49.703+00	2026-03-27 15:22:07.25+00	\N
84	14	TRANSACTION_UPDATE	Your transaction #15 has been accepted by a vendor and is being processed.	t	2026-03-13 06:04:54.617+00	2026-03-27 15:22:10.556+00	\N
85	14	TRANSACTION_COMPLETE	Your transaction #15 has been completed! You can view the payment proof in your dashboard.	t	2026-03-13 06:11:39.858+00	2026-03-27 15:22:10.722+00	\N
86	14	TRANSACTION_UPDATE	Your transaction #25 has been accepted by a vendor and is being processed.	t	2026-03-13 21:53:36.767+00	2026-03-27 15:22:12.2+00	\N
87	14	TRANSACTION_UPDATE	Your transaction #21 has been accepted by a vendor and is being processed.	t	2026-03-13 22:58:02.516+00	2026-03-27 15:22:12.461+00	\N
88	14	TRANSACTION_COMPLETE	Your transaction #21 has been completed! You can view the payment proof in your dashboard.	t	2026-03-13 23:05:58.272+00	2026-03-27 15:22:12.97+00	\N
90	14	TRANSACTION_UPDATE	Proof of payment for transaction #35 has been uploaded and is pending verification.	t	2026-03-22 13:43:23.459+00	2026-03-27 15:22:34.048+00	\N
99	2	complaint	New complaint filed by user ama kuffour1. Subject: vendor test 1	f	2026-03-29 21:51:17.502+00	2026-03-29 21:51:17.502+00	\N
100	14	TRANSACTION_UPDATE	Your transaction #34 has been accepted by a vendor and is being processed.	f	2026-03-29 22:27:55.924+00	2026-03-29 22:27:55.924+00	\N
101	14	TRANSACTION_COMPLETE	Your transaction #34 has been completed! You can view the payment proof in your dashboard.	f	2026-03-29 22:29:24.517+00	2026-03-29 22:29:24.517+00	\N
102	19	complaint	A client filed a complaint mapped to a transaction you handled. Subject: hmmmm	t	2026-03-29 22:30:55.118+00	2026-03-29 22:31:30.808+00	\N
105	14	TRANSACTION_UPDATE	Transaction of 500 CAD initiated. Your rate is locked for 15 minutes.	f	2026-04-02 23:35:50.907+00	2026-04-02 23:35:50.907+00	\N
104	14	TRANSACTION_UPDATE	Transaction of 500 CAD initiated. Your rate is locked for 15 minutes.	f	2026-04-02 23:35:50.885+00	2026-04-02 23:35:50.885+00	\N
106	14	TRANSACTION_UPDATE	Transaction of 500 CAD initiated. Your rate is locked for 15 minutes.	f	2026-04-02 23:36:20.068+00	2026-04-02 23:36:20.068+00	\N
107	14	TRANSACTION_UPDATE	Transaction of 500 CAD initiated. Your rate is locked for 15 minutes.	f	2026-04-02 23:36:42.381+00	2026-04-02 23:36:42.381+00	\N
110	14	TRANSACTION_UPDATE	Transaction of 522 GHS initiated. Your rate is locked for 15 minutes.	f	2026-04-03 19:51:54.459+00	2026-04-03 19:51:54.459+00	\N
112	14	TRANSACTION_UPDATE	Transaction of 500 GHS initiated. Your rate is locked for 15 minutes.	f	2026-04-04 18:15:52.694+00	2026-04-04 18:15:52.694+00	\N
113	14	TRANSACTION_UPDATE	Proof of payment for transaction #44 has been uploaded and is pending verification.	f	2026-04-04 18:33:05.459+00	2026-04-04 18:33:05.459+00	\N
114	14	TRANSACTION_UPDATE	Your transaction #45 status has been updated to PROCESSING.	t	2026-04-07 01:03:21.208+00	2026-04-07 01:26:22.264+00	\N
111	14	TRANSACTION_UPDATE	Transaction of 500 CAD initiated. Your rate is locked for 15 minutes.	t	2026-04-03 20:10:15.442+00	2026-04-07 01:26:26.163+00	\N
108	14	TRANSACTION_UPDATE	Transaction of 500 CAD initiated. Your rate is locked for 15 minutes.	t	2026-04-02 23:37:15.4+00	2026-04-07 01:26:26.935+00	\N
109	14	TRANSACTION_UPDATE	Transaction of 350 CAD initiated. Your rate is locked for 15 minutes.	t	2026-04-03 18:54:03.725+00	2026-04-07 01:26:27.716+00	\N
103	2	complaint	New complaint filed by user Tijani Moro. Subject: hmmmm	t	2026-03-29 22:30:55.121+00	2026-04-07 01:15:49.547+00	\N
116	14	TRANSACTION_UPDATE	Your transaction #45 status has been updated to SENT.	t	2026-04-07 01:04:12.302+00	2026-04-07 01:26:21.513+00	\N
115	14	TRANSACTION_UPDATE	Your transaction #44 status has been updated to PROCESSING.	t	2026-04-07 01:03:31.328+00	2026-04-07 01:26:24.19+00	\N
118	18	TRANSACTION_UPDATE	New 200 GHS transaction request available in your region.	f	2026-04-07 03:48:23.548+00	2026-04-07 03:48:23.548+00	/vendor?tab=pool&search=QT-20260407-U73T
119	21	TRANSACTION_UPDATE	New 200 GHS transaction request available in your region.	t	2026-04-07 03:48:23.609+00	2026-04-07 03:48:48.036+00	/vendor?tab=pool&search=QT-20260407-U73T
120	14	TRANSACTION_UPDATE	Transaction of 67 CAD initiated. Your rate is locked for 15 minutes.	f	2026-04-07 03:53:01.163+00	2026-04-07 03:53:01.163+00	/dashboard?search=QT-20260407-KHHN
121	21	TRANSACTION_UPDATE	New 67 CAD transaction request available in your region.	f	2026-04-07 03:53:08.077+00	2026-04-07 03:53:08.077+00	/vendor?tab=pool&search=QT-20260407-KHHN
124	18	TRANSACTION_UPDATE	New 98 GHS transaction request available in your region.	f	2026-04-07 04:10:18.448+00	2026-04-07 04:10:18.448+00	/vendor?tab=pool&search=QT-20260407-8ZDO
125	21	TRANSACTION_UPDATE	New 98 GHS transaction request available in your region.	t	2026-04-07 04:10:18.464+00	2026-04-07 04:10:46.416+00	/vendor?tab=pool&search=QT-20260407-8ZDO
123	14	TRANSACTION_UPDATE	Transaction of 98 GHS initiated. Your rate is locked for 15 minutes.	t	2026-04-07 04:10:15.139+00	2026-04-07 04:19:18.303+00	/dashboard?search=QT-20260407-8ZDO
117	14	TRANSACTION_UPDATE	Transaction of 200 GHS initiated. Your rate is locked for 15 minutes.	t	2026-04-07 03:48:17.768+00	2026-04-07 04:19:23.628+00	/dashboard?search=QT-20260407-U73T
126	14	TRANSACTION_UPDATE	Your transaction #46 status has been updated to PROCESSING.	f	2026-04-07 04:39:28.588+00	2026-04-07 04:39:28.588+00	\N
127	14	TRANSACTION_UPDATE	Your transaction #47 status has been updated to PROCESSING.	f	2026-04-07 04:39:28.594+00	2026-04-07 04:39:28.594+00	\N
128	14	TRANSACTION_UPDATE	Your transaction #41 status has been updated to PROCESSING.	f	2026-04-08 01:37:09.141+00	2026-04-08 01:37:09.141+00	\N
129	14	TRANSACTION_UPDATE	Your transaction #41 status has been updated to PROCESSING.	f	2026-04-08 01:37:09.212+00	2026-04-08 01:37:09.212+00	\N
130	14	TRANSACTION_UPDATE	Your transaction #41 status has been updated to PROCESSING.	f	2026-04-08 01:37:10.114+00	2026-04-08 01:37:10.114+00	\N
131	14	TRANSACTION_UPDATE	Your transaction #41 status has been updated to PROCESSING.	f	2026-04-08 01:37:10.826+00	2026-04-08 01:37:10.826+00	\N
132	14	TRANSACTION_UPDATE	Your transaction #43 status has been updated to PROCESSING.	f	2026-04-08 01:41:52.551+00	2026-04-08 01:41:52.551+00	\N
133	14	TRANSACTION_UPDATE	Proof of payment for transaction #41 has been uploaded and is pending verification.	f	2026-04-08 01:42:45.775+00	2026-04-08 01:42:45.775+00	\N
134	14	TRANSACTION_UPDATE	Proof of payment for transaction #41 has been uploaded and is pending verification.	f	2026-04-08 01:42:47.902+00	2026-04-08 01:42:47.902+00	\N
135	14	TRANSACTION_UPDATE	Proof of payment for transaction #41 has been uploaded and is pending verification.	f	2026-04-08 01:42:58.288+00	2026-04-08 01:42:58.288+00	\N
136	14	TRANSACTION_UPDATE	Proof of payment for transaction #41 has been uploaded and is pending verification.	f	2026-04-08 01:43:52.862+00	2026-04-08 01:43:52.862+00	\N
137	14	TRANSACTION_UPDATE	Your transaction #41 status has been updated to SENT.	f	2026-04-08 01:43:54.85+00	2026-04-08 01:43:54.85+00	\N
138	21	NEW_TRANSACTION_ASSIGNED	An admin has manually assigned Transaction #QT-20260407-U73T to your active operations.	t	2026-04-08 02:00:43.465+00	2026-04-08 02:01:08.809+00	\N
139	14	TRANSACTION_UPDATE	Your transaction #40 status has been updated to PROCESSING.	f	2026-04-08 02:44:11.67+00	2026-04-08 02:44:11.67+00	\N
140	14	TRANSACTION_UPDATE	Proof of payment for transaction #40 has been uploaded and is pending verification.	f	2026-04-08 02:44:46.541+00	2026-04-08 02:44:46.541+00	\N
141	14	TRANSACTION_UPDATE	Your transaction #40 status has been updated to SENT.	f	2026-04-08 02:44:47.826+00	2026-04-08 02:44:47.826+00	\N
144	14	TRANSACTION_UPDATE	Proof of payment for transaction #10 has been uploaded and is pending verification.	f	2026-04-08 02:49:46.364+00	2026-04-08 02:49:46.364+00	\N
145	14	TRANSACTION_UPDATE	Your transaction #10 status has been updated to SENT.	f	2026-04-08 02:49:48.17+00	2026-04-08 02:49:48.17+00	\N
146	14	TRANSACTION_UPDATE	Transaction of 500 GHS initiated. Your rate is locked for 15 minutes.	f	2026-04-09 01:46:38.467+00	2026-04-09 01:46:38.467+00	/dashboard?search=QT-20260409-5JQ9
147	18	TRANSACTION_UPDATE	New 500 GHS transaction request available in your region.	f	2026-04-09 01:46:40.345+00	2026-04-09 01:46:40.345+00	/vendor?tab=pool&search=QT-20260409-5JQ9
148	21	TRANSACTION_UPDATE	New 500 GHS transaction request available in your region.	f	2026-04-09 01:46:40.363+00	2026-04-09 01:46:40.363+00	/vendor?tab=pool&search=QT-20260409-5JQ9
150	21	TRANSACTION_UPDATE	New 78 CAD transaction request available in your region.	f	2026-04-09 02:15:29.966+00	2026-04-09 02:15:29.966+00	/vendor?tab=pool&search=QT-20260409-J9RW
153	21	TRANSACTION_UPDATE	New 700 CAD transaction request available in your region.	f	2026-04-09 02:34:08.92+00	2026-04-09 02:34:08.92+00	/vendor?tab=pool&search=QT-20260409-P90Q
152	14	TRANSACTION_UPDATE	Transaction of 700 CAD initiated. Your rate is locked for 20 minutes.	t	2026-04-09 02:34:07.863+00	2026-04-09 02:40:33.431+00	/dashboard?search=QT-20260409-P90Q
122	19	TRANSACTION_UPDATE	New 67 CAD transaction request available in your region.	t	2026-04-07 03:53:08.589+00	2026-04-11 02:54:09.359+00	/vendor?tab=pool&search=QT-20260407-KHHN
142	19	NEW_TRANSACTION_ASSIGNED	An admin has manually assigned Transaction #QT-20260402-UMS2 to your active operations.	t	2026-04-08 02:45:16.703+00	2026-04-11 02:54:09.359+00	\N
143	19	NEW_TRANSACTION_ASSIGNED	An admin has manually assigned Transaction #QT-20260212-DR7P to your active operations.	t	2026-04-08 02:49:30.229+00	2026-04-11 02:54:09.359+00	\N
151	19	TRANSACTION_UPDATE	New 78 CAD transaction request available in your region.	t	2026-04-09 02:15:29.974+00	2026-04-11 02:54:09.359+00	/vendor?tab=pool&search=QT-20260409-J9RW
154	19	TRANSACTION_UPDATE	New 700 CAD transaction request available in your region.	t	2026-04-09 02:34:08.943+00	2026-04-11 02:54:09.359+00	/vendor?tab=pool&search=QT-20260409-P90Q
156	18	TRANSACTION_UPDATE	New 78 GHS transaction request available in your region.	f	2026-04-12 02:15:12.218+00	2026-04-12 02:15:12.218+00	/vendor?tab=pool&search=QT-20260412-08I7
157	21	TRANSACTION_UPDATE	New 78 GHS transaction request available in your region.	f	2026-04-12 02:15:12.234+00	2026-04-12 02:15:12.234+00	/vendor?tab=pool&search=QT-20260412-08I7
158	14	TRANSACTION_UPDATE	Proof of payment for transaction #52 has been uploaded and is pending verification.	f	2026-04-12 02:18:39.191+00	2026-04-12 02:18:39.191+00	\N
159	14	TRANSACTION_UPDATE	Proof of payment for transaction #50 has been uploaded and is pending verification.	f	2026-04-12 02:24:05.535+00	2026-04-12 02:24:05.535+00	\N
161	18	TRANSACTION_UPDATE	New 50 GHS transaction request available in your region.	f	2026-04-12 02:30:14.531+00	2026-04-12 02:30:14.531+00	/vendor?tab=pool&search=QT-20260412-XJV8
162	21	TRANSACTION_UPDATE	New 50 GHS transaction request available in your region.	f	2026-04-12 02:30:14.542+00	2026-04-12 02:30:14.542+00	/vendor?tab=pool&search=QT-20260412-XJV8
160	14	TRANSACTION_UPDATE	Transaction of 50 GHS initiated. Your rate is locked for 20 minutes.	t	2026-04-12 02:30:11.264+00	2026-04-12 02:42:50.28+00	/dashboard?search=QT-20260412-XJV8
155	14	TRANSACTION_UPDATE	Transaction of 78 GHS initiated. Your rate is locked for 20 minutes.	t	2026-04-12 02:15:10.87+00	2026-04-12 02:49:43.805+00	/dashboard?search=QT-20260412-08I7
163	14	TRANSACTION_UPDATE	Proof of payment for transaction #53 has been uploaded and is pending verification.	t	2026-04-12 02:30:27.249+00	2026-04-12 02:37:45.226+00	\N
149	14	TRANSACTION_UPDATE	Transaction of 78 CAD initiated. Please proceed to complete your payment.	t	2026-04-09 02:15:28.629+00	2026-04-12 02:37:47.812+00	/dashboard?search=QT-20260409-J9RW
164	14	TRANSACTION_UPDATE	Transaction of 123 GHS initiated. Your rate is locked for 20 minutes.	f	2026-04-12 03:49:46.228+00	2026-04-12 03:49:46.228+00	/dashboard?search=QT-20260412-1484
165	18	TRANSACTION_UPDATE	New 123 GHS transaction request available in your region.	f	2026-04-12 03:49:47.719+00	2026-04-12 03:49:47.719+00	/vendor?tab=pool&search=QT-20260412-1484
166	21	TRANSACTION_UPDATE	New 123 GHS transaction request available in your region.	f	2026-04-12 03:49:47.731+00	2026-04-12 03:49:47.731+00	/vendor?tab=pool&search=QT-20260412-1484
168	18	TRANSACTION_UPDATE	New 55 GHS transaction request available in your region.	f	2026-04-14 01:36:57.053+00	2026-04-14 01:36:57.053+00	/vendor?tab=pool&search=QT-20260414-4U5J
169	21	TRANSACTION_UPDATE	New 55 GHS transaction request available in your region.	f	2026-04-14 01:36:57.247+00	2026-04-14 01:36:57.247+00	/vendor?tab=pool&search=QT-20260414-4U5J
167	14	TRANSACTION_UPDATE	Transaction of 55 GHS initiated. Your rate is locked for 20 minutes.	t	2026-04-14 01:36:54.196+00	2026-04-14 01:41:40.011+00	/dashboard?search=QT-20260414-4U5J
170	14	TRANSACTION_UPDATE	Proof of payment for transaction #55 has been uploaded and is pending verification.	f	2026-04-14 01:42:28.68+00	2026-04-14 01:42:28.68+00	\N
171	14	TRANSACTION_UPDATE	Proof of payment for transaction #55 has been uploaded and is pending verification.	f	2026-04-14 01:42:49.306+00	2026-04-14 01:42:49.306+00	\N
172	14	TRANSACTION_UPDATE	Transaction of 89 CAD initiated. Your rate is locked for 20 minutes.	f	2026-04-14 02:00:52.009+00	2026-04-14 02:00:52.009+00	/dashboard?search=QT-20260414-6WPK
173	21	TRANSACTION_UPDATE	New 89 CAD transaction request available in your region.	f	2026-04-14 02:00:54.192+00	2026-04-14 02:00:54.192+00	/vendor?tab=pool&search=QT-20260414-6WPK
174	19	TRANSACTION_UPDATE	New 89 CAD transaction request available in your region.	f	2026-04-14 02:00:54.515+00	2026-04-14 02:00:54.515+00	/vendor?tab=pool&search=QT-20260414-6WPK
175	14	TRANSACTION_UPDATE	Proof of payment for transaction #56 has been uploaded and is pending verification.	f	2026-04-14 02:01:31.054+00	2026-04-14 02:01:31.054+00	\N
176	14	TRANSACTION_UPDATE	Transaction of 890 GHS initiated. Your rate is locked for 20 minutes.	f	2026-04-14 02:17:17.428+00	2026-04-14 02:17:17.428+00	/dashboard?search=QT-20260414-VCR5
177	18	TRANSACTION_UPDATE	New 890 GHS transaction request available in your region.	f	2026-04-14 02:17:18.528+00	2026-04-14 02:17:18.528+00	/vendor?tab=pool&search=QT-20260414-VCR5
178	21	TRANSACTION_UPDATE	New 890 GHS transaction request available in your region.	f	2026-04-14 02:17:18.718+00	2026-04-14 02:17:18.718+00	/vendor?tab=pool&search=QT-20260414-VCR5
179	14	TRANSACTION_UPDATE	Proof of payment for transaction #57 has been uploaded and is pending verification.	f	2026-04-14 02:18:14.65+00	2026-04-14 02:18:14.65+00	\N
181	21	TRANSACTION_UPDATE	New 120 CAD transaction request available in your region.	f	2026-04-14 02:24:14.709+00	2026-04-14 02:24:14.709+00	/vendor?tab=pool&search=QT-20260414-NO6Q
182	19	TRANSACTION_UPDATE	New 120 CAD transaction request available in your region.	f	2026-04-14 02:24:14.733+00	2026-04-14 02:24:14.733+00	/vendor?tab=pool&search=QT-20260414-NO6Q
183	14	TRANSACTION_UPDATE	Proof of payment for transaction #58 has been uploaded and is pending verification.	f	2026-04-14 02:24:32.829+00	2026-04-14 02:24:32.829+00	\N
180	14	TRANSACTION_UPDATE	Transaction of 120 CAD initiated. Your rate is locked for 20 minutes.	t	2026-04-14 02:24:13.822+00	2026-04-14 02:46:40.212+00	/dashboard?search=QT-20260414-NO6Q
185	21	TRANSACTION_UPDATE	New 78 CAD transaction request available in your region.	f	2026-04-14 04:27:57.954+00	2026-04-14 04:27:57.954+00	/vendor?tab=pool&search=QT-20260414-FB16
186	19	TRANSACTION_UPDATE	New 78 CAD transaction request available in your region.	f	2026-04-14 04:27:57.961+00	2026-04-14 04:27:57.961+00	/vendor?tab=pool&search=QT-20260414-FB16
187	14	TRANSACTION_UPDATE	Proof of payment for transaction #59 has been uploaded and is pending verification.	f	2026-04-14 04:28:12.773+00	2026-04-14 04:28:12.773+00	\N
184	14	TRANSACTION_UPDATE	Transaction of 78 CAD initiated. Your rate is locked for 20 minutes.	t	2026-04-14 04:27:56.378+00	2026-04-14 04:28:25.84+00	/dashboard?search=QT-20260414-FB16
\.


--
-- Data for Name: PaymentMethods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PaymentMethods" (id, type, currency, details, is_active, "createdAt", "updatedAt") FROM stdin;
2	interac-cad	CAD	{"email":"pay@qwiktransfers.ca","name":"Qwiktransfers Canada"}	t	2026-02-11 00:58:25.036+00	2026-02-11 00:59:40.704+00
1	momo-ghs	GHS	{"number":"024 123 456","name":"Qwiktransfers Limited"}	t	2026-02-11 00:57:41.67+00	2026-02-11 00:59:41.623+00
\.


--
-- Data for Name: RateAlerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RateAlerts" (id, "userId", "targetRate", direction, "isActive", "createdAt", "updatedAt") FROM stdin;
5	14	8.5	above	t	2026-02-17 12:11:53.226+00	2026-02-17 12:11:53.226+00
\.


--
-- Data for Name: Rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Rates" (id, pair, rate, "createdAt", "updatedAt", use_api, manual_rate, spread) FROM stdin;
2	GHS-CAD	0.112360	2026-02-05 12:53:19.059+00	2026-04-19 00:29:04.959+00	f	8.9000	5.00
\.


--
-- Data for Name: Referrals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Referrals" (id, referrer_id, referred_user_id, status, reward_amount, reward_currency, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20260203223832-create-user.js
20260203224049-create-transaction.js
20260203224212-create-rate.js
20260205103300-add-kyc-to-users.js
20260205132637-add-profile-fields-to-users.js
20260205144157-add-country-and-pin-to-users.js
20260205155321-add-verification-and-reset-fields-to-users.js
20260205173636-add-verification-token-expires-to-users.js
20260205180758-add-unique-constraint-to-user-email.js
20260206200552-add-kyc-details-to-users.js
20260206233338-add-proof-uploaded-at-to-transactions.js
20260209110642-make-phone-unique.js
20260209141000-add-vendor-fields.js
20260209145854-add-account-status-to-users.js
20260211003145-create-payment-method.js
20260211010351-add-manual-rate-fields-to-rates.js
20260212041202-add_sent_at_to_transactions.js
20260216143429-create-system-config.js
20260216153100-add-account-number-to-users.js
20260216164900-create-audit-log.js
20260216165000-create-notification.js
20260216165100-create-rate-alert.js
20260216165200-add-rate-locking-to-transactions.js
20260217123000-add-unique-pair-to-rates.js
20260221153800-add-transaction-id-to-transactions.js
20260224020300-populate-transaction-ids.js
20260228203239-add-expo-push-token-to-users.js
20260311163738-create-inquiry.js
20260313044500-add-rejection-reason-to-transactions.js
20260313050800-add-vendor-proof-url-to-transactions.js
20260324215917-create-complaint.js
20260325174500-split-user-full-name.js
20260326125102-add-referral-fields.js
20260328155500-add-danger-zone-fields-to-users.js
20260407020000-add_link_to_notifications.js
20260411130000-create-announcements.js
20260411130001-create-announcement-dismissals.js
20260418033300-add-last-login-to-users.js
\.


--
-- Data for Name: SystemConfigs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemConfigs" (id, key, value, "createdAt", "updatedAt") FROM stdin;
2	auto_audit_cleanup	"false"	2026-03-07 00:00:32.072+00	2026-03-07 00:01:05.043+00
3	system_logo	"uploads/logo-1772842521736-42171940.png"	2026-03-07 00:15:21.755+00	2026-03-07 00:15:21.755+00
4	rate_lock_time	20	2026-04-08 03:21:41.139+00	2026-04-08 03:21:41.139+00
5	system_address	""	2026-04-14 05:33:10.998+00	2026-04-14 05:33:10.998+00
7	system_email	"info@qwiktransfers.com"	2026-04-14 05:33:11.02+00	2026-04-14 05:33:11.02+00
8	system_contact	""	2026-04-14 05:33:10.988+00	2026-04-14 05:33:10.988+00
1	tiered_limits	{"level1": 600, "level2": 5000, "level3": 50000}	2026-02-16 14:45:15.845+00	2026-04-19 00:29:14.757+00
6	system_name	"QwikTransfers | Welcome"	2026-04-14 05:33:11.005+00	2026-04-19 00:29:45.711+00
\.


--
-- Data for Name: Transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transactions" (id, "userId", type, amount_sent, exchange_rate, amount_received, recipient_details, status, proof_url, "createdAt", "updatedAt", proof_uploaded_at, "vendorId", sent_at, rate_locked_until, locked_rate, transaction_id, market_rate, base_currency_profit, rejection_reason, vendor_proof_url) FROM stdin;
2	2	GHS-CAD	500	0.09	45	{"name": "Kwame Mensah", "type": "momo", "account": "0244112233"}	pending	\N	2026-02-05 12:53:19.068+00	2026-02-05 12:53:19.068+00	\N	\N	\N	\N	\N	QT-20260205-1O4R	\N	0	\N	\N
8	14	CAD-GHS	500	0.1178	58.9	{"name": "gorgina agyei", "note": "vals", "type": "momo", "account": "0244512130", "bank_name": "", "interac_email": "", "momo_provider": "Telecel Cash", "transit_number": "", "admin_reference": "QW-DHY6M", "institution_number": ""}	cancelled		2026-02-06 23:18:52.732+00	2026-02-07 11:12:14.557+00	\N	\N	\N	\N	\N	QT-20260206-MD07	\N	0	\N	\N
7	14	GHS-CAD	500	0.1178	58.9	{"name": "jefw", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "gerg", "momo_provider": "", "transit_number": "", "admin_reference": "QW-YZX3T", "institution_number": ""}	processing	/uploads/proof-1770462678465-931119833.jpg	2026-02-06 15:07:49.252+00	2026-02-09 13:07:51.028+00	2026-02-07 11:11:18.617+00	\N	\N	\N	\N	QT-20260206-ZWSG	\N	0	\N	\N
9	14	CAD-GHS	10	0.113636	1.13636	{"name": "haruna abass", "note": "", "type": "bank", "account": "202020202020", "bank_name": "GCB Bank", "interac_email": "", "momo_provider": "", "transit_number": "", "admin_reference": "QW-BCEQV", "institution_number": ""}	sent		2026-02-11 17:42:42.932+00	2026-02-12 04:29:48.859+00	\N	19	2026-02-12 04:29:48.859+00	\N	\N	QT-20260211-TXD8	\N	0	\N	\N
5	14	GHS-CAD	200	0.1178	23.56	{"name": "Ladeen", "note": "for fees", "type": "momo", "account": "02000044", "bank_name": "", "momo_provider": "AirtelTigo Money", "admin_reference": "QW-HMYJG"}	sent	/uploads/proof-1770380310894-972049988.jpeg	2026-02-06 12:17:35.462+00	2026-02-10 23:04:23.723+00	\N	18	\N	\N	\N	QT-20260206-JC14	\N	0	\N	\N
6	14	GHS-CAD	120	0.1178	14.136000000000001	{"name": "Alhaji", "note": "", "type": "bank", "account": "21843533", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "23423", "admin_reference": "QW-RN9QE", "institution_number": "244"}	processing	/uploads/proof-1770382326753-245619600.jpg	2026-02-06 12:51:27.654+00	2026-02-12 01:37:59.405+00	\N	18	\N	\N	\N	QT-20260206-TA5R	\N	0	\N	\N
1	1	GHS-CAD	12	0.1	1.2000000000000002	{"name": "Recipient Name", "account": "123456"}	sent	/uploads/proof-1770293853478-823351365.jpg	2026-02-03 23:41:41.634+00	2026-02-12 01:38:24.665+00	\N	18	\N	\N	\N	QT-20260203-VLI7	\N	0	\N	\N
20	14	CAD-GHS	40	8.699964	348	{"name": "kapo laazio", "note": "", "type": "momo", "account": "020200202", "bank_name": "", "interac_email": "", "momo_provider": "AirtelTigo Money", "transit_number": "", "admin_reference": "QW-YJCLB", "institution_number": ""}	pending		2026-02-17 14:39:12.682+00	2026-02-17 14:39:12.682+00	\N	\N	\N	\N	\N	QT-20260217-CCKA	\N	0	\N	\N
3	2	GHS-CAD	1000	0.09	90	{"name": "Ama Serwaa", "type": "bank", "account": "1002233445"}	sent	/uploads/sample_receipt.jpg	2026-02-04 12:53:19.068+00	2026-02-05 00:53:19.068+00	\N	\N	\N	\N	\N	QT-20260204-PXHR	\N	0	\N	\N
4	3	GHS-CAD	2500	0.092	230	{"name": "Yaw Boateng", "type": "momo", "account": "0555998877"}	processing	/uploads/proof_test.png	2026-02-05 12:53:19.068+00	2026-02-05 12:53:19.068+00	\N	\N	\N	\N	\N	QT-20260205-2QPB	\N	0	\N	\N
18	14	GHS-CAD	300	0.114943	34.48	{"name": "prince", "note": "50/2", "type": "interac", "account": "", "bank_name": "", "interac_email": "prince@email.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-3TN9Z", "institution_number": ""}	sent	/uploads/proof-1771336449390-668260014.jpg	2026-02-17 13:38:08.466+00	2026-02-17 13:56:04.954+00	2026-02-17 13:54:09.436+00	18	2026-02-17 13:56:04.953+00	\N	\N	QT-20260217-ZHHV	\N	0	\N	\N
19	14	GHS-CAD	20	0.114943	2.3	{"name": "baba", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "b@fmf.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-HFTFF", "institution_number": ""}	sent	/uploads/proof-1771338007877-222160926.jpeg	2026-02-17 14:19:33.477+00	2026-02-17 14:20:41.685+00	2026-02-17 14:20:07.912+00	18	2026-02-17 14:20:41.685+00	\N	\N	QT-20260217-WX96	\N	0	\N	\N
14	20	CAD-GHS	5	8.899964	44.5	{"name": "Maa Adwo", "note": "", "type": "momo", "account": "026666666", "bank_name": "", "interac_email": "", "momo_provider": "Telecel Cash", "transit_number": "", "admin_reference": "QW-HCM7L", "institution_number": ""}	completed		2026-02-12 07:03:20.119+00	2026-03-13 06:04:13.543+00	\N	19	\N	\N	\N	QT-20260212-HHEV	\N	0	\N	/uploads/proofs/vendor-proof-1773381853515.jpeg
24	14	CAD-GHS	5	8.699964	43.5	{"name": "Kofi", "note": "Good", "type": "momo", "account": "02444", "momo_provider": "Telecel Cash", "admin_reference": "QW-3L7XQ"}	processing		2026-02-19 21:11:18.994+00	2026-03-22 17:40:07.336+00	\N	19	\N	\N	\N	QT-20260219-1B6V	\N	0	\N	\N
23	14	GHS-CAD	200	0.114943	22.99	{"name": "Ncnfb", "type": "interac", "email": "Naming"}	cancelled		2026-02-19 16:19:51.004+00	2026-03-13 03:49:09.761+00	\N	\N	\N	\N	\N	QT-20260219-88OZ	\N	0	\N	\N
16	14	GHS-CAD	30	0.114943	3.45	{"name": "wadud", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "r@ewr.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-MZ8Y5", "institution_number": ""}	cancelled		2026-02-17 13:07:17.643+00	2026-03-13 03:49:28.886+00	\N	\N	\N	\N	\N	QT-20260217-SAKQ	\N	0	\N	\N
21	14	GHS-CAD	66	0.114943	7.59	{"name": "hamza", "note": "", "type": "bank", "account": "202222", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "11111", "admin_reference": "QW-9Z7C4", "institution_number": "333"}	sent	/uploads/proof-1773373786477-717911916.jpg	2026-02-17 19:14:53.421+00	2026-03-13 23:05:58.263+00	2026-03-13 03:49:46.491+00	21	\N	\N	\N	QT-20260217-EDXW	\N	0	\N	/uploads/proofs/vendor-proof-1773443158228.jpeg
22	14	GHS-CAD	200	0.114943	22.99	{"name": "Ncnfb", "type": "interac", "email": "Naming"}	cancelled		2026-02-19 16:19:29.444+00	2026-03-13 03:50:10.34+00	\N	\N	\N	\N	\N	QT-20260219-8T0A	\N	0	\N	\N
26	14	CAD-GHS	200	8.699964	1739.99	{"name": "gorge", "note": "", "type": "bank", "account": "222222", "bank_name": "GCB Bank", "admin_reference": "QW-N827D"}	completed	/uploads/proof-1773374132426-457765259.pdf	2026-02-19 22:45:41.15+00	2026-03-13 05:45:36.909+00	2026-03-13 03:55:32.507+00	19	\N	\N	\N	QT-20260219-QD92	\N	0	\N	/uploads/proofs/vendor-proof-1773380736796.png
15	14	CAD-GHS	40	8.899964	356	{"name": "kuffor", "note": "", "type": "bank", "account": "202222222", "bank_name": "Ecobank Ghana", "interac_email": "", "momo_provider": "", "transit_number": "", "admin_reference": "QW-8AEXK", "institution_number": ""}	completed	/uploads/proof-1771332116425-819830601.jpg	2026-02-17 00:29:55.969+00	2026-03-13 06:11:39.792+00	2026-02-17 12:41:56.452+00	19	\N	\N	\N	QT-20260217-930I	\N	0	\N	/uploads/proofs/vendor-proof-1773382299705.jpg
25	14	CAD-GHS	200	8.699964	1739.99	{"name": "gorge", "note": "", "type": "bank", "account": "222222", "bank_name": "GCB Bank", "admin_reference": "QW-N827D"}	sent	/uploads/proof-1773373529751-571683372.jpeg	2026-02-19 22:45:10.578+00	2026-03-22 17:40:59.385+00	2026-03-13 03:45:29.761+00	19	\N	\N	\N	QT-20260219-B1DC	\N	0	\N	/uploads/proofs/vendor-proof-1774201255428.png
10	14	GHS-CAD	200	0.113636	22.7272	{"name": "mabel abagine", "note": "for food babe", "type": "interac", "account": "342342423", "bank_name": "", "interac_email": "wefwef@efe.cok", "momo_provider": "", "transit_number": "22324", "admin_reference": "QW-BTM5A", "institution_number": "987"}	sent	/uploads/proof-1775616584826-796295100.pdf	2026-02-11 18:17:58.128+00	2026-04-08 02:49:47.32+00	2026-04-08 02:49:44.86+00	18	2026-04-08 02:49:47.315+00	\N	\N	QT-20260211-SSNC	\N	0	\N	/uploads/proof-1775616584826-796295100.pdf
17	14	CAD-GHS	500	8.699964	4349.98	{"name": "kapo", "note": "we the best", "type": "bank", "account": "404040404", "bank_name": "GCB Bank", "interac_email": "", "momo_provider": "", "transit_number": "", "admin_reference": "QW-M39Q6", "institution_number": ""}	processing	/uploads/proof-1771334361390-44831496.pdf	2026-02-17 13:18:58.069+00	2026-03-13 06:04:49.596+00	2026-02-17 13:19:21.426+00	19	\N	\N	\N	QT-20260217-5K7E	\N	0	\N	\N
13	20	GHS-CAD	200	0.113636	22.73	{"name": "Henry Asamoah", "note": "pocket money", "type": "bank", "account": "20202020202020", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "12344", "admin_reference": "QW-5CMDF", "institution_number": "123"}	sent	/uploads/proof-1770872786132-525197332.png	2026-02-12 05:04:04.009+00	2026-02-12 07:08:42.986+00	2026-02-12 05:06:26.206+00	19	2026-02-12 07:08:42.985+00	\N	\N	QT-20260212-B1PR	\N	0	\N	\N
12	14	GHS-CAD	400	0.113636	45.45	{"name": "toffic", "note": "food", "type": "bank", "account": "2032029329932939", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "1234", "admin_reference": "QW-2FQFY", "institution_number": "323"}	sent		2026-02-12 03:54:14.113+00	2026-02-12 04:07:51.024+00	\N	19	\N	\N	\N	QT-20260212-INYR	\N	0	\N	\N
37	14	CAD-GHS	500	8.357989	4178.99	{"name": "Mohammed Amin Ibrahim", "note": "", "type": "momo", "account": "0257887464", "momo_provider": "MTN Momo", "admin_reference": "QW-J4473"}	pending		2026-04-02 23:33:54.512+00	2026-04-02 23:33:54.512+00	\N	\N	\N	\N	\N	QT-20260402-2BOJ	0.119646	0	\N	\N
30	14	GHS-CAD	500	0.114943	57.47	{"name": "Salify", "note": "Goods", "type": "interac", "interac_email": "arlinawestley@gmail.com", "admin_reference": "QW-WRCQM"}	pending	/uploads/proof-1772411134715-248386076.jpeg	2026-03-01 13:20:03.868+00	2026-03-02 00:25:34.743+00	2026-03-02 00:25:34.743+00	\N	\N	\N	\N	QT-20260301-5WQB	\N	0	\N	\N
35	14	GHS-CAD	3000	0.119646	358.94	{"name": "Abdul Wadud", "note": "pocket money", "type": "bank", "account": "23u43tiu34u34iuui", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "56866", "admin_reference": "QW-2C6M8", "institution_number": "123"}	pending	/uploads/proof-1774186988911-590565183.pdf	2026-03-22 13:39:58.02+00	2026-03-22 13:43:09.152+00	2026-03-22 13:43:09.151+00	\N	\N	\N	\N	QT-20260322-VVQJ	0.119646	0	\N	\N
32	22	CAD-GHS	55	8.699964	478.5	{"name": "Kofi", "note": "", "type": "bank", "account": "048484849949", "bank_name": "Zenith Bank", "admin_reference": "QW-FE3JR"}	processing	/uploads/proof-1772372490777-261300033.jpeg	2026-03-01 13:31:12.872+00	2026-03-22 13:47:52.788+00	2026-03-01 13:41:30.859+00	19	\N	\N	\N	QT-20260301-GYET	\N	0	\N	\N
29	14	GHS-CAD	500	0.114943	57.47	{"name": "Salify", "note": "Goods", "type": "interac", "interac_email": "arlinawestley@gmail.com", "admin_reference": "QW-WRCQM"}	cancelled		2026-03-01 13:19:16.196+00	2026-03-12 21:14:42.699+00	\N	\N	\N	\N	\N	QT-20260301-PRBQ	\N	0	\N	\N
33	14	GHS-CAD	500	0.114943	57.47	{"name": "Amin", "note": "", "type": "interac", "interac_email": "bdh@dd.com", "admin_reference": "QW-553DY"}	processing	/uploads/proof-1772412403303-886889331.jpeg	2026-03-02 00:29:24.057+00	2026-03-13 04:14:13.038+00	2026-03-02 00:46:43.343+00	21	\N	\N	\N	QT-20260302-ZBNS	\N	0	\N	\N
31	22	CAD-GHS	50	8.699964	435	{"name": "Taaku.", "note": "", "type": "momo", "account": "0244515121", "momo_provider": "Telecel Cash", "admin_reference": "QW-P2WLX"}	processing	/uploads/proof-1772371668127-711091828.jpeg	2026-03-01 13:26:06.376+00	2026-03-13 04:14:16.342+00	2026-03-01 13:27:48.17+00	21	\N	\N	\N	QT-20260301-0R8N	\N	0	\N	\N
27	14	CAD-GHS	50	8.699964	435	{"name": "Kiki", "note": "Food wai", "type": "momo", "account": "055555", "momo_provider": "Telecel Cash", "admin_reference": "QW-GB7X6"}	sent	/uploads/proof-1773373397478-505590115.jpg	2026-02-19 23:07:44.224+00	2026-03-13 04:31:27.664+00	2026-03-13 03:43:17.529+00	\N	2026-03-13 04:31:27.651+00	\N	\N	QT-20260219-RM2X	\N	0	\N	\N
38	14	CAD-GHS	500	8.357989	4178.99	{"name": "Mohammed Amin Ibrahim", "note": "", "type": "momo", "account": "0257887464", "momo_provider": "MTN Momo", "admin_reference": "QW-J4473"}	pending		2026-04-02 23:34:14.828+00	2026-04-02 23:34:14.828+00	\N	\N	\N	\N	\N	QT-20260402-SR3C	0.119646	0	\N	\N
28	14	CAD-GHS	100	8.699964	870	{"name": "Hen", "note": "Does", "type": "momo", "account": "024444", "momo_provider": "MTN Momo", "admin_reference": "QW-XWZ8N"}	completed	/uploads/proof-1771542978123-468555540.png	2026-02-19 23:15:37.523+00	2026-03-13 05:47:06.301+00	2026-02-19 23:16:18.819+00	19	\N	\N	\N	QT-20260219-ER44	\N	0	\N	/uploads/proofs/vendor-proof-1773380826228.pdf
39	14	CAD-GHS	500	8.357989	4178.99	{"name": "Mohammed Amin Ibrahim", "note": "", "type": "momo", "account": "0257887464", "momo_provider": "MTN Momo", "admin_reference": "QW-J4473"}	pending		2026-04-02 23:34:32.764+00	2026-04-02 23:34:32.764+00	\N	\N	\N	\N	\N	QT-20260402-7AHR	0.119646	0	\N	\N
36	14	GHS-CAD	600	0.119646	71.79	{"name": "vivian agyei", "note": "token", "type": "interac", "account": "", "bank_name": "", "interac_email": "vivian@email.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-M5GSG", "institution_number": ""}	sent	/uploads/proof-1774200366617-184554938.jpg	2026-03-22 17:24:30.835+00	2026-03-27 14:19:59.967+00	2026-03-22 17:26:06.847+00	21	\N	\N	\N	QT-20260322-6CV7	0.119646	0	\N	/uploads/proofs/vendor-proof-1774621199706.png
34	14	CAD-GHS	200	8.699964	1739.99	{"name": "Bxbxb", "note": "", "type": "bank", "account": "8485894", "bank_name": "Fidelity Bank", "admin_reference": "QW-Y8VBJ"}	sent		2026-03-02 00:30:30.047+00	2026-03-29 22:29:24.503+00	\N	19	\N	\N	\N	QT-20260302-YTKQ	\N	0	momo number issue	/uploads/proofs/vendor-proof-1774823364474.png
42	14	CAD-GHS	350	8.357989	2925.3	{"name": "Mohammed Amin Ibrahim ", "note": "", "type": "momo", "account": "0257887464", "momo_provider": "MTN Momo", "admin_reference": "QW-N39SJ"}	pending		2026-04-03 18:51:49.65+00	2026-04-03 18:51:49.65+00	\N	\N	\N	\N	\N	QT-20260403-0G6X	0.119646	0	\N	\N
45	14	GHS-CAD	500	0.119646	59.82	{"name": "troaore", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "t@gmail.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-LR5L4", "institution_number": ""}	sent		2026-04-04 18:15:24.433+00	2026-04-07 01:04:11.248+00	\N	\N	2026-04-07 01:04:11.239+00	\N	\N	QT-20260404-DQC0	0.119646	0.0030	\N	\N
44	14	CAD-GHS	500	8.357989	4178.99	{"name": "Bab", "note": "", "type": "momo", "account": "02444", "momo_provider": "Telecel Cash", "admin_reference": "QW-VLX38"}	processing	/uploads/proof-1775327575970-333229071.jpg	2026-04-03 20:10:07.836+00	2026-04-07 01:03:30.979+00	2026-04-04 18:32:59.074+00	\N	\N	\N	\N	QT-20260403-GKEN	0.119646	0	\N	\N
40	14	CAD-GHS	500	8.357989	4178.99	{"name": "Mohammed Amin Ibrahim", "note": "", "type": "momo", "account": "0257887464", "momo_provider": "MTN Momo", "admin_reference": "QW-J4473"}	sent	/uploads/proof-1775616284908-70185187.png	2026-04-02 23:36:10.118+00	2026-04-08 02:44:47.438+00	2026-04-08 02:44:44.937+00	\N	2026-04-08 02:44:47.384+00	\N	\N	QT-20260402-REOJ	0.119646	-34427.9541	\N	/uploads/proof-1775616284908-70185187.png
47	14	CAD-GHS	67	8.357989	559.99	{"name": "ert", "note": "", "type": "momo", "account": "0222", "bank_name": "", "interac_email": "", "momo_provider": "AirtelTigo Money", "transit_number": "", "admin_reference": "QW-Y594D", "institution_number": ""}	processing		2026-04-07 03:52:55.296+00	2026-04-08 01:44:20.981+00	\N	21	\N	\N	\N	QT-20260407-KHHN	0.119646	0	\N	\N
43	14	GHS-CAD	522	0.119646	62.46	{"name": "Fred", "note": "", "type": "interac", "interac_email": "gh@th.com", "admin_reference": "QW-9WTS5"}	processing		2026-04-03 19:51:42.739+00	2026-04-08 01:41:50.934+00	\N	\N	\N	\N	\N	QT-20260403-DNEL	0.119646	0	\N	\N
48	14	GHS-CAD	98	0.119646	11.73	{"name": "yt", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "bgh@k.nm", "momo_provider": "", "transit_number": "", "admin_reference": "QW-ET6MC", "institution_number": ""}	processing		2026-04-07 04:10:06.534+00	2026-04-08 01:36:24.272+00	\N	21	\N	2026-04-07 04:25:06.213+00	\N	QT-20260407-8ZDO	0.119646	0	\N	\N
46	14	GHS-CAD	200	0.119646	23.93	{"name": "wkljm", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "knfvk@ef.cok", "momo_provider": "", "transit_number": "", "admin_reference": "QW-JQ4VD", "institution_number": ""}	processing		2026-04-07 03:48:10.177+00	2026-04-08 02:00:43.33+00	\N	21	\N	\N	\N	QT-20260407-U73T	0.119646	0	\N	\N
41	14	CAD-GHS	500	8.357989	4178.99	{"name": "Mohammed Amin Ibrahim", "note": "", "type": "momo", "account": "0257887464", "momo_provider": "MTN Momo", "admin_reference": "QW-J4473"}	sent	/uploads/proof-1775612631713-180055268.png	2026-04-02 23:36:43.122+00	2026-04-08 02:45:16.666+00	2026-04-08 01:43:51.726+00	19	2026-04-08 01:43:53.834+00	\N	\N	QT-20260402-UMS2	0.119646	-34427.9541	\N	/uploads/proof-1775612631713-180055268.png
11	14	CAD-GHS	20	8.800028	176	{"name": "wahidu", "note": "", "type": "momo", "account": "02200202", "bank_name": "", "interac_email": "", "momo_provider": "MTN Momo", "transit_number": "", "admin_reference": "QW-3E2T3", "institution_number": ""}	sent		2026-02-12 03:53:11.502+00	2026-04-08 02:49:30.172+00	\N	19	2026-02-12 04:18:43.768+00	\N	\N	QT-20260212-DR7P	\N	0	\N	\N
49	14	GHS-CAD	500	0.113636	56.82	{"name": "tulsam", "note": "", "type": "bank", "account": "20202022222", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "222", "admin_reference": "QW-6VU24", "institution_number": "111"}	pending		2026-04-09 01:46:28.812+00	2026-04-09 01:46:28.812+00	\N	\N	\N	2026-04-09 02:06:28.777+00	\N	QT-20260409-5JQ9	0.113636	0	\N	\N
51	14	CAD-GHS	700	8.420982	5894.69	{"name": "kjj c", "note": "", "type": "momo", "account": "03232", "bank_name": "", "interac_email": "", "momo_provider": "MTN Momo", "transit_number": "", "admin_reference": "QW-HRJFP", "institution_number": ""}	pending		2026-04-09 02:34:01.974+00	2026-04-09 02:34:01.974+00	\N	\N	\N	2026-04-09 02:54:01.965+00	\N	QT-20260409-P90Q	0.118751	0	\N	\N
52	14	GHS-CAD	78	0.118751	9.26	{"name": "hamza", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "h@gmail.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-7BATL", "institution_number": ""}	pending	/uploads/proof-1775960308566-571871269.pdf	2026-04-12 02:15:05.98+00	2026-04-12 02:18:36.997+00	2026-04-12 02:18:36.986+00	\N	\N	2026-04-12 02:35:05.954+00	\N	QT-20260412-08I7	0.118751	0	\N	\N
50	14	CAD-GHS	78	8.800028	686.4	{"name": "riri", "note": "", "type": "bank", "account": "2202020", "bank_name": "Ecobank Ghana", "interac_email": "", "momo_provider": "", "transit_number": "", "admin_reference": "QW-KKQRA", "institution_number": ""}	pending	/uploads/proof-1775960643221-742840890.pdf	2026-04-09 02:15:23.198+00	2026-04-12 02:24:03.513+00	2026-04-12 02:24:03.51+00	\N	\N	\N	\N	QT-20260409-J9RW	0.113636	0	\N	\N
53	14	GHS-CAD	50	0.118751	5.94	{"name": "guy", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "kf@erf.om", "momo_provider": "", "transit_number": "", "admin_reference": "QW-2JK9B", "institution_number": ""}	pending	/uploads/proof-1775961025911-409148102.png	2026-04-12 02:30:06.467+00	2026-04-12 02:30:26.468+00	2026-04-12 02:30:26.467+00	\N	\N	2026-04-12 02:50:06.288+00	\N	QT-20260412-XJV8	0.118751	0	\N	\N
54	14	GHS-CAD	123	0.118751	14.61	{"name": "jkefn1", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "lkefmkl@wef.com", "momo_provider": "", "transit_number": "", "admin_reference": "", "institution_number": ""}	pending		2026-04-12 03:49:40.89+00	2026-04-12 03:49:40.89+00	\N	\N	\N	2026-04-12 04:09:40.798+00	\N	QT-20260412-1484	0.118751	0	\N	\N
56	14	CAD-GHS	89	8.420982	749.47	{"name": "huy", "note": "", "type": "bank", "account": "88888888888", "bank_name": "Absa Bank", "interac_email": "", "momo_provider": "", "transit_number": "", "admin_reference": "QW-EM435", "institution_number": ""}	pending	/uploads/proof-1776132086725-658781860.jpg	2026-04-14 02:00:40.543+00	2026-04-14 02:01:29.203+00	2026-04-14 02:01:29.191+00	\N	\N	2026-04-14 02:20:40.121+00	\N	QT-20260414-6WPK	0.118751	0	\N	\N
55	14	GHS-CAD	55	0.118751	6.53	{"name": "gyt", "note": "", "type": "interac", "account": "", "bank_name": "", "interac_email": "we@hm.com", "momo_provider": "", "transit_number": "", "admin_reference": "QW-Z4G2L", "institution_number": ""}	pending	/uploads/proof-1776130967298-367749877.pdf	2026-04-14 01:36:46.26+00	2026-04-14 01:42:47.67+00	2026-04-14 01:42:47.669+00	\N	\N	2026-04-14 01:56:45.966+00	\N	QT-20260414-4U5J	0.118751	0	\N	\N
57	14	GHS-CAD	890	0.118751	105.69	{"name": "gorge", "note": "", "type": "bank", "account": "12233444444", "bank_name": "", "interac_email": "", "momo_provider": "", "transit_number": "12234", "admin_reference": "QW-YXLZY", "institution_number": "123"}	pending	/uploads/proof-1776133081373-249395762.png	2026-04-14 02:17:10.897+00	2026-04-14 02:18:09.756+00	2026-04-14 02:18:08.797+00	\N	\N	2026-04-14 02:37:10.379+00	\N	QT-20260414-VCR5	0.118751	0	\N	\N
58	14	CAD-GHS	120	8.420982	1010.52	{"name": "dan", "note": "", "type": "momo", "account": "0222222", "bank_name": "", "interac_email": "", "momo_provider": "Telecel Cash", "transit_number": "", "admin_reference": "QW-SVRZY", "institution_number": ""}	pending	/uploads/proof-1776133471011-798844976.png	2026-04-14 02:24:08.796+00	2026-04-14 02:24:31.981+00	2026-04-14 02:24:31.981+00	\N	\N	2026-04-14 02:44:08.772+00	\N	QT-20260414-NO6Q	0.118751	0	\N	\N
59	14	CAD-GHS	78	8.420982	656.84	{"name": "we", "note": "", "type": "bank", "account": "123", "bank_name": "Standard Chartered", "interac_email": "", "momo_provider": "", "transit_number": "", "admin_reference": "QW-TVS3W", "institution_number": ""}	pending	/uploads/proof-1776140891757-243153356.jpg	2026-04-14 04:27:51.586+00	2026-04-14 04:28:11.906+00	2026-04-14 04:28:11.9+00	\N	\N	2026-04-14 04:47:51.532+00	\N	QT-20260414-FB16	0.118751	0	\N	\N
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, email, password, role, kyc_status, balance_ghs, balance_cad, "createdAt", "updatedAt", kyc_document, phone, profile_picture, country, transaction_pin, is_email_verified, verification_token, reset_password_token, reset_password_expires, verification_token_expires, kyc_document_type, kyc_document_id, kyc_front_url, kyc_back_url, is_online, is_active, account_number, expo_push_token, first_name, middle_name, last_name, referral_code, referred_by_id, deletion_requested_at, deletion_reason, deactivation_reason, two_factor_secret, two_factor_enabled, sub_role, last_login) FROM stdin;
21	milco.vendor@qwiktransfer.com	$2b$10$dow2hhMPQoisiCgqBAiRYOpAstuNde7nE2j55SeO7ZjnH8P/BNxLe	vendor	verified	0	0	2026-02-12 06:09:35.979+00	2026-04-18 04:04:17.299+00	\N	+233123456789	\N	All	$2b$10$y8jOUSEh4Bw0UZ.XH.vis.MQ9wVI9q1717ehHDqkHGhx71i9K1rhi	t	\N	\N	\N	\N	\N	\N	\N	\N	t	t	QT-V-4220	\N	Milco		Asare	QT-780YB6	\N	\N	\N	\N	\N	f	super	\N
1	tj@gmail.com	$2b$10$6TqpzvLXuwqHaAc1N7eFOumaXv61008.6N2oeLGQkeY34QnsIyI26	user	unverified	12.00	0.00	2026-02-03 23:41:30.252+00	2026-04-14 05:01:22.09+00	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	f	t	QT-625339	\N	\N	\N	\N	QT-3DW16T	\N	\N	\N	\N	\N	f	super	\N
18	ama@vendor.com	$2b$10$WUI0kh894Ho5kFTEOXALj.ueEaw7IX58NJ8IQB0yMZkfKUQldrHoq	vendor	verified	0	0	2026-02-10 22:55:54.897+00	2026-04-14 05:01:21.938+00	\N	+23355347715	/uploads/avatar-1770865307699-964898177.png	Ghana	$2b$10$DQ/Gd1E8if8BxexPFXkDKundvefUOg2JBMX.akJFoU5/4PEWo1SkG	t	\N	\N	\N	\N	\N	\N	\N	\N	t	t	QT-V-5522	\N	kujo		mula	QT-D0KVAM	\N	\N	\N	\N	\N	f	super	\N
4	verified@example.com	$2b$10$NDg/LKrKeBrvTxLhr2jWJ.PLZWFQtkUNwAb1jpDndy6VHZubjpfhG	user	verified	0	0	2026-02-05 12:53:18.996+00	2026-04-14 05:01:21.938+00	\N	\N	\N	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	f	t	QT-596560	\N	\N	\N	\N	QT-EV4CSG	\N	\N	\N	\N	\N	f	super	\N
16	frimpong@gmail.com	$2b$10$.6nv0WXQ2s0hKbs0bcCw8.EkhKy8ux9cFDRD6QdEjYO93Q5ZvERGm	user	unverified	0	0	2026-02-09 10:55:08.961+00	2026-04-14 05:01:21.938+00	\N	\N	\N	Ghana	$2b$10$XEmzYjYhzyo2qy952oC57.b6u1BXcm0mLH6dJXVQV/v2h.zODIOpC	f	da3acabc615bf56723cde4ce99f143d83729a3f3bd8cc7b991639287c931fcd5	\N	\N	2026-02-10 10:55:08.928+00	\N	\N	\N	\N	f	t	QT-273777	\N	frimpong		agyei	QT-CS09AJ	\N	\N	\N	\N	\N	f	super	\N
17	tjhackx111@gmail.com1	$2b$10$FHf20cIYsIhEKW2r7JjGKOiTLMfGURrKTWwAMzJCHWhmzQd/lRAPa	user	unverified	0	0	2026-02-09 11:44:31.668+00	2026-04-14 05:01:21.938+00	\N	+233255213120	\N	Ghana	$2b$10$ayt9o8CXTnZIRdVSxopM5.enOoKVjKMxCHVFfGF5beN.tPNIt.fTe	f	f0b99f0c7466961bb6b1568fc48c460d89472172964ee519c7007c950daf1516	\N	\N	2026-02-10 11:44:31.664+00	\N	\N	\N	\N	f	t	QT-808012	\N	ewfew			QT-4P5292	\N	\N	\N	\N	\N	f	super	\N
23	alhassan@gmail.com	$2b$10$1uvxJ4eDs5UpahpMgx3aruSIW7eqMJBD2K15E7FowaznC03GNI70a	user	unverified	0	0	2026-03-25 18:17:03.897+00	2026-04-14 05:01:21.938+00	\N	+2335523123421	\N	Ghana	$2b$10$2B.ymQFCdviBBWHax0YrGu1gWewOSt1mh3ddGwA0B5l.PtJdZGkoK	f	69d3796edf64b2878c21720cbeed1ddcd65555fbe4380211f47cfd89d5c9e1e5	\N	\N	2026-03-26 18:17:03.89+00	\N	\N	\N	\N	f	t	QT-788212	\N	alhassan		memuna	QT-RB09GM	\N	\N	\N	\N	\N	f	super	\N
19	ama.vendor@qwiktransfers.com	$2b$10$BTe7K9dt8R2KHFRGU/a7TerTMdrhFBRJuGmGEy37jdDiYDiMseR.e	vendor	verified	0	0	2026-02-11 17:44:04.696+00	2026-04-14 05:01:21.938+00	\N	05555555	/uploads/avatar-1773346174409-380468179.png	Canada	$2b$10$5Tx27XnEvT4/UriEzQQM/.gztS/W.9a.ldMoUmqKEOwejL6OE68NO	t	\N	\N	\N	\N	\N	\N	\N	\N	t	t	QT-V-9095	\N	ama		kuffour1	QT-MDHQLC	\N	\N	\N	\N	\N	f	super	\N
3	user@example.com	$2b$10$NDg/LKrKeBrvTxLhr2jWJ.PLZWFQtkUNwAb1jpDndy6VHZubjpfhG	user	unverified	0	0	2026-02-05 12:53:18.996+00	2026-04-14 05:01:21.938+00	\N	0553477150	/uploads/avatar-1770300265627-329219701.png	\N	\N	f	\N	\N	\N	\N	\N	\N	\N	\N	f	t	QT-341015	\N	Tijani		Moro	QT-GA2GQP	\N	\N	\N	\N	\N	f	super	\N
24	opoku@gmail.com	$2b$10$KGMDmBXQWssO8GDPfzFH/.qdnrrikPxvYOodNBtKf07gIMR6IqeQG	user	unverified	0	0	2026-03-25 18:37:43.996+00	2026-04-14 05:01:21.938+00	\N	+132423442344	\N	Canada	$2b$10$4eaQJrhSSzA/ycEZIrfXKOTu0/n1WyGj9/wu.K/nCf4QFmGl3V0Gq	f	a52616b9899e09a52508b12d1adfe888d4f124c81c823c1114d6297d53b4c83b	\N	\N	2026-03-26 18:37:43.984+00	\N	\N	\N	\N	f	t	QT-978531	\N	auguestin	boakye	opoku	QT-RYCU83	\N	\N	\N	\N	\N	f	super	\N
22	tijanimoro@yahoo.com	$2b$10$2R07OmoLW1p8vIhTpDgDsuGyCYfFXb2spgQGNEsQLFeZJf7Vwf0g.	user	unverified	0	0	2026-02-28 17:46:14.622+00	2026-04-14 05:01:21.938+00	\N	+1222111111	\N	Canada	$2b$10$8JGYhl5D2WwB4wAdv9bbD.CQAhq0cIRaFi2NYNha/.AuQtf1yYdvi	f	4adf80f58d6ca10c557215e8be075d46f2a69986582ddf141cd7f4b8232a59ae	\N	\N	2026-03-01 17:46:14.602+00	\N	\N	\N	\N	f	t	QT-809853	\N	Donna		Lopez	QT-ZY61FA	\N	\N	\N	\N	\N	f	super	\N
15	testmetj1@gmail.com	$2b$10$a8h0SoHkcHkYQUS/3KIyn.yWFNOKG90Pos4iZRixWUxoayzOIDwEq	user	verified	0	0	2026-02-06 21:03:15.026+00	2026-04-14 05:01:21.938+00	\N	+233255213121	\N	Ghana	\N	f	97bd095a24bb20ed7969762a7f7c4f222234be4194ce9bcef9637f21867922c0	\N	\N	2026-02-07 21:03:15.003+00	ghana_card	GH-awdw	/uploads/front-1770413242476-209826609.jpg	/uploads/back-1770413242518-175820179.jpg	f	t	QT-699314	\N	Donna		Lopez	QT-VRPG1D	\N	\N	\N	\N	\N	f	super	\N
14	tjhackx111@gmail.com	$2b$10$Xo.VFf9NDhIU7ZdI2Akgg.jkz/pSAjSABa7EVpMmPkU8XH6IYD8Hy	user	unverified	2286.00	1480.00	2026-02-05 23:37:58.424+00	2026-04-18 03:55:22.493+00	\N	+233553477150	/uploads/avatar-1775172719978-122350035.png	Ghana	$2b$10$eYPG3IZGanFYA9UNJHCOouGaLEy1DMYYyRnu8mfHXpJbmFVUz8QXO	t	cf699c73b05ef3f32fb5d3b056aae77955ee6d6c320ad7cf4ef2bda72900fd2d	\N	\N	2026-02-06 23:37:58.341+00	\N	\N	\N	\N	f	t	QT-212460	ExponentPushToken[pSzoN5O_XAbH6WZSghySjz]	Jeffery	Owusu	Ansah	QT-QA2376	\N	\N	\N	\N	\N	f	super	\N
20	testmetj@gmail.com	$2b$10$y5m1FJDqNRUfNo.oqw5cG.8DkGT5mnkMy7EjSXs8wmx5q2jaME0yi	user	verified	200.00	0.00	2026-02-12 04:51:28.942+00	2026-04-14 05:01:22.12+00	\N	+233244512121	/uploads/avatar-1770872913717-20636866.png	Ghana	$2b$10$9DvbRFUIbb0p.GY.Db0xxOsOdcrWIlB5cFnX1VnLGRwYbMk.39EK.	t	249a1ffca99fafe0e34dba6e02cfe35e880a4c7492daeea2151e326f70f7ffe7	\N	\N	2026-02-13 04:51:28.905+00	ghana_card	GH-123344-123	/uploads/front-1770872227700-123028245.png	/uploads/back-1770872227735-64989153.png	f	t	QT-475305	\N	Jeffery		Frimpong	QT-OVO7EF	\N	\N	\N	\N	\N	f	super	\N
2	admin@qwiktransfers.com	$2b$10$NDg/LKrKeBrvTxLhr2jWJ.PLZWFQtkUNwAb1jpDndy6VHZubjpfhG	admin	verified	1000.00	0.00	2026-02-05 12:53:18.996+00	2026-04-18 19:01:25.885+00	\N	\N	/uploads/avatar-1770861218145-877940415.png	\N	$2b$10$ACCLZyODY/pGk/a3k1sFn.2YF1Yhp1cfgWc1TqNLzwm2IqxWFdG0O	f	\N	\N	\N	\N	\N	\N	\N	\N	f	t	QT-563645	\N	Baba		Ali	QT-B9COJM	\N	\N	\N	\N	KFNDUSCCHA4EQSSQKVEGWV3IG4ZHS3CHOQXU6TDGEVVVIVSHONWQ	t	super	2026-04-18 03:55:11.613+00
25	kudus@gmail.com	$2b$10$AYQqC2nwJYOdj7Ayg.P8Ke6ZrPojELjowaf0.yorbRki9Dd246E2e	user	verified	0	0	2026-03-25 18:46:53.455+00	2026-04-18 03:18:23.722+00	\N	+233552144785	\N	Ghana	$2b$10$jgJG75OIf661ROJ2L/BxQ.NqxX4AeBBxFAZWFcA0EbN0uWPoCyoZ.	f	beea0f645830b171c357ec0849ff324ae546e81ab6ffee56fc3e6a694317f7fc	\N	\N	2026-03-26 18:46:53.454+00	\N	\N	\N	\N	f	t	QT-909171	ExponentPushToken[Mpql8oArntrAx96zcttLFe]	kudus		abdul	QT-S00QPS	\N	\N	\N	\N	\N	f	super	\N
26	nuru.admin@qwiktransfers.com	$2b$10$kFEC3/L2rtcs9aIvJcVtNO0GYF.YjbOgtXSZKZ6k4ZCBbdlqDwG5S	admin	verified	0	0	2026-04-11 00:55:47.764+00	2026-04-18 20:57:36.302+00	\N	02444	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	f	t	QT-193335	\N	nurudeen		yahya	\N	\N	\N	\N	\N	\N	f	support	\N
\.


--
-- Name: AnnouncementDismissals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AnnouncementDismissals_id_seq"', 1, true);


--
-- Name: Announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Announcements_id_seq"', 2, true);


--
-- Name: AuditLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AuditLogs_id_seq"', 443, true);


--
-- Name: Complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Complaints_id_seq"', 7, true);


--
-- Name: Inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Inquiries_id_seq"', 34, true);


--
-- Name: Notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notifications_id_seq"', 187, true);


--
-- Name: PaymentMethods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."PaymentMethods_id_seq"', 2, true);


--
-- Name: RateAlerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RateAlerts_id_seq"', 41, true);


--
-- Name: Rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Rates_id_seq"', 2, true);


--
-- Name: Referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Referrals_id_seq"', 1, false);


--
-- Name: SystemConfigs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."SystemConfigs_id_seq"', 8, true);


--
-- Name: Transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transactions_id_seq"', 59, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_id_seq"', 26, true);


--
-- Name: AnnouncementDismissals AnnouncementDismissals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AnnouncementDismissals"
    ADD CONSTRAINT "AnnouncementDismissals_pkey" PRIMARY KEY (id);


--
-- Name: Announcements Announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_pkey" PRIMARY KEY (id);


--
-- Name: AuditLogs AuditLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);


--
-- Name: Complaints Complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Complaints"
    ADD CONSTRAINT "Complaints_pkey" PRIMARY KEY (id);


--
-- Name: Inquiries Inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inquiries"
    ADD CONSTRAINT "Inquiries_pkey" PRIMARY KEY (id);


--
-- Name: Notifications Notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY (id);


--
-- Name: PaymentMethods PaymentMethods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PaymentMethods"
    ADD CONSTRAINT "PaymentMethods_pkey" PRIMARY KEY (id);


--
-- Name: RateAlerts RateAlerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RateAlerts"
    ADD CONSTRAINT "RateAlerts_pkey" PRIMARY KEY (id);


--
-- Name: Rates Rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Rates"
    ADD CONSTRAINT "Rates_pkey" PRIMARY KEY (id);


--
-- Name: Referrals Referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT "Referrals_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: SystemConfigs SystemConfigs_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemConfigs"
    ADD CONSTRAINT "SystemConfigs_key_key" UNIQUE (key);


--
-- Name: SystemConfigs SystemConfigs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SystemConfigs"
    ADD CONSTRAINT "SystemConfigs_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY (id);


--
-- Name: Transactions Transactions_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_transaction_id_key" UNIQUE (transaction_id);


--
-- Name: Users Users_account_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_account_number_key" UNIQUE (account_number);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_phone_unique_constraint; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_phone_unique_constraint" UNIQUE (phone);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_referral_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_referral_code_key" UNIQUE (referral_code);


--
-- Name: announcement_user_dismissal_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX announcement_user_dismissal_unique ON public."AnnouncementDismissals" USING btree ("announcementId", "userId");


--
-- Name: rates_pair_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX rates_pair_unique ON public."Rates" USING btree (pair);


--
-- Name: users_referral_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_referral_code ON public."Users" USING btree (referral_code);


--
-- Name: AnnouncementDismissals AnnouncementDismissals_announcementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AnnouncementDismissals"
    ADD CONSTRAINT "AnnouncementDismissals_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES public."Announcements"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AnnouncementDismissals AnnouncementDismissals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AnnouncementDismissals"
    ADD CONSTRAINT "AnnouncementDismissals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Announcements Announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Announcements"
    ADD CONSTRAINT "Announcements_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AuditLogs AuditLogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notifications Notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notifications"
    ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RateAlerts RateAlerts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RateAlerts"
    ADD CONSTRAINT "RateAlerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referrals Referrals_referred_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT "Referrals_referred_user_id_fkey" FOREIGN KEY (referred_user_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Referrals Referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Referrals"
    ADD CONSTRAINT "Referrals_referrer_id_fkey" FOREIGN KEY (referrer_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transactions Transactions_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Users Users_referred_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_referred_by_id_fkey" FOREIGN KEY (referred_by_id) REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 14wdvipV7qO6SEwMvVGrICSbVzokOf3tRCFiV5Lv2jSZX6TMMfYlNHJpmFFrYrr

