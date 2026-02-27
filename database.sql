--
-- PostgreSQL database dump
--

\restrict vcvAJoIgaKcwIhod1EDfsXqywR2RYTngomVaaHO7ChfkT3k9kDiVV4NnTAmWqeQ

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-02-28 01:23:38

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 234 (class 1259 OID 16531)
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id integer NOT NULL,
    user_id integer,
    date date NOT NULL,
    clock_in timestamp without time zone,
    clock_out timestamp without time zone,
    status character varying(20) DEFAULT 'ontime'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    late_seconds integer DEFAULT 0
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16530)
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendances_id_seq OWNER TO postgres;

--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 233
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- TOC entry 222 (class 1259 OID 16408)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16407)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 228 (class 1259 OID 16468)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    product_name character varying(150) NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16467)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 226 (class 1259 OID 16441)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer,
    order_number character varying(50) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    payment_method character varying(50) NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    change_amount numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'completed'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16440)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 236 (class 1259 OID 16551)
-- Name: payrolls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payrolls (
    id integer NOT NULL,
    user_id integer,
    period_month character varying(7) NOT NULL,
    base_salary numeric(15,2) DEFAULT 0,
    bonus numeric(15,2) DEFAULT 0,
    deductions numeric(15,2) DEFAULT 0,
    net_salary numeric(15,2) DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text
);


ALTER TABLE public.payrolls OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16550)
-- Name: payrolls_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payrolls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payrolls_id_seq OWNER TO postgres;

--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 235
-- Name: payrolls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payrolls_id_seq OWNED BY public.payrolls.id;


--
-- TOC entry 224 (class 1259 OID 16419)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer,
    name character varying(150) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    image_url character varying(255),
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16418)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 232 (class 1259 OID 16513)
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16512)
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shifts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_id_seq OWNER TO postgres;

--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 231
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- TOC entry 230 (class 1259 OID 16490)
-- Name: stock_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_logs (
    id integer NOT NULL,
    product_id integer,
    user_id integer,
    type character varying(20) NOT NULL,
    quantity integer NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stock_logs OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16489)
-- Name: stock_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 229
-- Name: stock_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_logs_id_seq OWNED BY public.stock_logs.id;


--
-- TOC entry 220 (class 1259 OID 16388)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'kasir'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    shift_id integer,
    base_salary numeric(15,2) DEFAULT 0,
    otp_code character varying(10),
    otp_expiry timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16387)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4921 (class 2604 OID 16534)
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 16411)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 16471)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 16444)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 16554)
-- Name: payrolls id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrolls ALTER COLUMN id SET DEFAULT nextval('public.payrolls_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 16422)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 16516)
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 16493)
-- Name: stock_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_logs ALTER COLUMN id SET DEFAULT nextval('public.stock_logs_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16391)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5129 (class 0 OID 16531)
-- Dependencies: 234
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.attendances (id, user_id, date, clock_in, clock_out, status, notes, created_at, late_seconds) VALUES (1, 2, '2026-02-26', '2026-02-26 22:35:45.858', '2026-02-26 22:35:55.323', 'ontime', NULL, '2026-02-26 22:35:45.909698', 0);
INSERT INTO public.attendances (id, user_id, date, clock_in, clock_out, status, notes, created_at, late_seconds) VALUES (3, 4, '2026-02-26', '2026-02-27 00:23:21.468', '2026-02-27 01:54:47.908', 'late', NULL, '2026-02-27 00:23:21.471242', 5001);
INSERT INTO public.attendances (id, user_id, date, clock_in, clock_out, status, notes, created_at, late_seconds) VALUES (5, 3, '2026-02-27', '2026-02-27 22:32:52.714', NULL, 'late', NULL, '2026-02-27 22:32:52.722364', 27172);


--
-- TOC entry 5117 (class 0 OID 16408)
-- Dependencies: 222
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories (id, name, created_at, updated_at) VALUES (2, 'Makanan', '2026-02-25 23:41:03.500732', '2026-02-25 23:41:03.500732');
INSERT INTO public.categories (id, name, created_at, updated_at) VALUES (3, 'Minuman', '2026-02-25 23:41:10.958123', '2026-02-25 23:41:10.958123');
INSERT INTO public.categories (id, name, created_at, updated_at) VALUES (4, 'Cemilan', '2026-02-25 23:54:31.544077', '2026-02-25 23:54:31.544077');


--
-- TOC entry 5123 (class 0 OID 16468)
-- Dependencies: 228
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (1, 1, 1, 'Mie Jebew', 10000.00, 2, 20000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (2, 2, 1, 'Mie Jebew', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (3, 3, 1, 'Mie Jebew', 10000.00, 3, 30000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (4, 4, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (5, 4, 3, 'Kopi Hitam', 8000.00, 1, 8000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (6, 5, 3, 'Kopi Hitam', 8000.00, 5, 40000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (7, 5, 1, 'Mie Jebew', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (8, 5, 2, 'Nasi Goreng', 15000.00, 4, 60000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (9, 6, 2, 'Nasi Goreng', 15000.00, 2, 30000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (10, 7, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (11, 8, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (12, 9, 3, 'Kopi Hitam', 8000.00, 1, 8000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (13, 10, 1, 'Mie Jebew', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (14, 11, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (15, 12, 1, 'Mie Jebew', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (16, 13, 1, 'Mie Jebew', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (17, 14, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (18, 15, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (19, 16, 3, 'Kopi Hitam', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (20, 17, 2, 'Nasi Goreng', 15000.00, 1, 15000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (21, 18, 1, 'Mie Jebew', 10000.00, 2, 20000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (22, 18, 2, 'Nasi Goreng', 15000.00, 2, 30000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (23, 18, 3, 'Kopi Hitam', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (24, 19, 1, 'Mie Jebew', 10000.00, 1, 10000.00);
INSERT INTO public.order_items (id, order_id, product_id, product_name, price, quantity, subtotal) VALUES (25, 20, 4, 'Ice cream Rasah mbayar', 1000.00, 3, 3000.00);


--
-- TOC entry 5121 (class 0 OID 16441)
-- Dependencies: 226
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (1, 1, 'ORD-20260225-001', 20000.00, 0.00, 20000.00, 'cash', 50000.00, 30000.00, 'completed', '', '2026-02-26 02:03:24.080939', '2026-02-26 02:03:24.080939');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (2, 1, 'ORD-20260225-002', 10000.00, 0.00, 10000.00, 'cash', 10000.00, 0.00, 'completed', '', '2026-02-26 03:03:14.921387', '2026-02-26 03:03:14.921387');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (3, 2, 'ORD-20260226-003', 30000.00, 0.00, 30000.00, 'cash', 50000.00, 20000.00, 'completed', '', '2026-02-26 08:07:57.315433', '2026-02-26 08:07:57.315433');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (4, 2, 'ORD-20260226-004', 23000.00, 0.00, 23000.00, 'cash', 25000.00, 2000.00, 'completed', '', '2026-02-26 08:37:13.286549', '2026-02-26 08:37:13.286549');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (5, 2, 'ORD-20260226-005', 110000.00, 0.00, 110000.00, 'cash', 120000.00, 10000.00, 'completed', '', '2026-02-26 08:41:03.720906', '2026-02-26 08:41:03.720906');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (6, 2, 'ORD-20260226-006', 30000.00, 0.00, 30000.00, 'non-cash', 30000.00, 0.00, 'completed', '', '2026-02-26 08:46:40.742386', '2026-02-26 08:46:40.742386');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (7, 2, 'ORD-20260226-007', 15000.00, 0.00, 15000.00, 'cash', 20000.00, 5000.00, 'completed', '', '2026-02-26 08:49:35.519032', '2026-02-26 08:49:35.519032');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (8, 2, 'ORD-20260226-008', 15000.00, 0.00, 15000.00, 'non-cash', 15000.00, 0.00, 'completed', '', '2026-02-26 08:49:50.986058', '2026-02-26 08:49:50.986058');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (9, 2, 'ORD-20260226-009', 8000.00, 0.00, 8000.00, 'non-cash', 8000.00, 0.00, 'completed', '', '2026-02-26 09:34:34.907231', '2026-02-26 09:34:34.907231');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (10, 2, 'ORD-20260226-010', 10000.00, 0.00, 10000.00, 'non-cash', 10000.00, 0.00, 'completed', '', '2026-02-26 09:34:50.103852', '2026-02-26 09:34:50.103852');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (11, 2, 'ORD-20260226-011', 15000.00, 0.00, 15000.00, 'non-cash', 15000.00, 0.00, 'completed', '', '2026-02-26 09:45:00.429069', '2026-02-26 09:45:00.429069');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (12, 2, 'ORD-20260226-2886', 10000.00, 0.00, 10000.00, 'non-cash', 10000.00, 0.00, 'pending', '', '2026-02-26 09:48:25.465495', '2026-02-26 09:48:25.465495');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (13, 2, 'ORD-20260226-8297', 10000.00, 0.00, 10000.00, 'non-cash', 10000.00, 0.00, 'pending', '', '2026-02-26 09:52:03.29222', '2026-02-26 09:52:03.29222');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (14, 2, 'ORD-20260226-1266', 15000.00, 0.00, 15000.00, 'non-cash', 15000.00, 0.00, 'pending', '', '2026-02-26 09:55:32.082074', '2026-02-26 09:55:32.082074');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (15, 2, 'ORD-20260226-4712', 15000.00, 0.00, 15000.00, 'non-cash', 15000.00, 0.00, 'completed', '', '2026-02-26 09:59:37.820439', '2026-02-26 09:59:37.820439');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (16, 2, 'ORD-20260226-1620', 10000.00, 0.00, 10000.00, 'cash', 10000.00, 0.00, 'completed', '', '2026-02-26 23:45:39.84663', '2026-02-26 23:45:39.84663');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (17, 4, 'ORD-20260226-9611', 15000.00, 0.00, 15000.00, 'non-cash', 15000.00, 0.00, 'completed', '', '2026-02-27 01:15:52.955302', '2026-02-27 01:15:52.955302');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (18, 3, 'ORD-20260227-5440', 60000.00, 0.00, 60000.00, 'cash', 100000.00, 40000.00, 'completed', '', '2026-02-27 22:36:43.080109', '2026-02-27 22:36:43.080109');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (19, 3, 'ORD-20260227-2136', 10000.00, 0.00, 10000.00, 'non-cash', 10000.00, 0.00, 'completed', '', '2026-02-27 22:36:53.669576', '2026-02-27 22:36:53.669576');
INSERT INTO public.orders (id, user_id, order_number, subtotal, discount, total, payment_method, amount_paid, change_amount, status, notes, created_at, updated_at) VALUES (20, 3, 'ORD-20260227-5859', 3000.00, 0.00, 3000.00, 'non-cash', 3000.00, 0.00, 'completed', '', '2026-02-27 23:03:32.247057', '2026-02-27 23:03:32.247057');


--
-- TOC entry 5131 (class 0 OID 16551)
-- Dependencies: 236
-- Data for Name: payrolls; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.payrolls (id, user_id, period_month, base_salary, bonus, deductions, net_salary, status, created_at, notes) VALUES (2, 4, '2026-02', 2700000.00, 0.00, 2614186.00, 85814.00, 'pending', '2026-02-28 00:24:26.75445', 'Alpha 25 hari (-Rp 2.596.154). Total Telat: 1j 23m (-Rp 18.032).');
INSERT INTO public.payrolls (id, user_id, period_month, base_salary, bonus, deductions, net_salary, status, created_at, notes) VALUES (1, 2, '2026-02', 2500000.00, 50000.00, 2403846.00, 146154.00, 'pending', '2026-02-28 00:24:33.007107', 'Potongan tidak masuk 25 hari.');


--
-- TOC entry 5119 (class 0 OID 16419)
-- Dependencies: 224
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (id, category_id, name, description, price, stock, image_url, is_available, created_at, updated_at) VALUES (2, 2, 'Nasi Goreng', 'Nasi goreng spesial dengan harga terjangkau', 15000.00, 42, '/uploads/1772068233998-248319751.jpg', true, '2026-02-26 08:10:34.129208', '2026-02-26 08:10:34.129208');
INSERT INTO public.products (id, category_id, name, description, price, stock, image_url, is_available, created_at, updated_at) VALUES (3, 3, 'Kopi Hitam', 'Kopi hitam dengan rasa pekat dan nikmat', 10000.00, 71, '/uploads/1772068350240-170120196.jpg', true, '2026-02-26 08:12:30.457928', '2026-02-26 10:37:25.384685');
INSERT INTO public.products (id, category_id, name, description, price, stock, image_url, is_available, created_at, updated_at) VALUES (1, 2, 'Mie Jebew', 'Mie dengan rasa mantap', 10000.00, 88, '/uploads/1772068405118-323160204.jpg', true, '2026-02-25 23:59:18.973347', '2026-02-26 08:13:25.237323');
INSERT INTO public.products (id, category_id, name, description, price, stock, image_url, is_available, created_at, updated_at) VALUES (4, 4, 'Ice cream Rasah mbayar', 'Ice cream ino tidak di perjual belikan, hanya khusus untuk orang tertentu', 1000.00, 7, '/uploads/1772208094507-216428091.png', true, '2026-02-27 23:01:34.68982', '2026-02-27 23:02:32.986681');


--
-- TOC entry 5127 (class 0 OID 16513)
-- Dependencies: 232
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.shifts (id, name, start_time, end_time, created_at) VALUES (1, 'Shift Pagi', '07:00:00', '15:00:00', '2026-02-26 22:44:55.393297');
INSERT INTO public.shifts (id, name, start_time, end_time, created_at) VALUES (2, 'Shift Sore', '15:00:00', '23:00:00', '2026-02-26 22:45:24.992305');
INSERT INTO public.shifts (id, name, start_time, end_time, created_at) VALUES (3, 'Shift Malam', '23:00:00', '07:00:00', '2026-02-26 22:45:54.152858');


--
-- TOC entry 5125 (class 0 OID 16490)
-- Dependencies: 230
-- Data for Name: stock_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.stock_logs (id, product_id, user_id, type, quantity, note, created_at) VALUES (1, 1, 1, 'in', 1, 'Cancel dari pembeli', '2026-02-26 03:14:27.280733');
INSERT INTO public.stock_logs (id, product_id, user_id, type, quantity, note, created_at) VALUES (2, 4, 1, 'in', 8, 'Restock Manual', '2026-02-27 23:02:32.986681');


--
-- TOC entry 5115 (class 0 OID 16388)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, name, email, password, role, is_active, created_at, updated_at, shift_id, base_salary, otp_code, otp_expiry) VALUES (2, 'jaya Wardaya', 'Kasir1@kafe.com', '$2b$10$wOJyHNGEowCMvbc.ZMj8uuXrqPHis4UCuHL8EzsoFK84GOaPaiIK.', 'kasir', true, '2026-02-26 04:00:56.563997', '2026-02-26 08:40:40.802345', 1, 2500000.00, NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, updated_at, shift_id, base_salary, otp_code, otp_expiry) VALUES (4, 'indra jasa', 'indra@kafe.com', '$2b$10$Z5oarnCsF.Qepdxho/Cq3ewlPsWijZBahYZ22fBQhnE08U5Tu1eg2', 'kasir', true, '2026-02-26 23:53:36.225021', '2026-02-26 23:53:36.225021', 3, 2700000.00, NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, updated_at, shift_id, base_salary, otp_code, otp_expiry) VALUES (1, 'Admin Utama', 'admin@kafe.com', '$2b$10$7advwqgPKygrJIu4FtIpX.Ay0tv83B32/zTb0rcEaq55ZfQ85YSbC', 'admin', true, '2026-02-25 22:20:17.870997', '2026-02-25 22:20:17.870997', NULL, 0.00, NULL, NULL);
INSERT INTO public.users (id, name, email, password, role, is_active, created_at, updated_at, shift_id, base_salary, otp_code, otp_expiry) VALUES (3, 'Raden Asrama', 'raden@kafe.com', '$2b$10$meIj/4Xgj9VYBj0VF6gcgudkGD2alS42VoQQ/BDtzjP9zkn1MrQ2K', 'kasir', true, '2026-02-26 23:45:09.011157', '2026-02-26 23:45:09.011157', 2, 2500000.00, NULL, NULL);


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 233
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attendances_id_seq', 5, true);


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 221
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 227
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 25, true);


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 225
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 20, true);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 235
-- Name: payrolls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payrolls_id_seq', 2, true);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 223
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 4, true);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 231
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shifts_id_seq', 3, true);


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 229
-- Name: stock_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_logs_id_seq', 2, true);


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4951 (class 2606 OID 16542)
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 16544)
-- Name: attendances attendances_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_user_id_date_key UNIQUE (user_id, date);


--
-- TOC entry 4937 (class 2606 OID 16417)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 16478)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 16461)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 4943 (class 2606 OID 16459)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 16564)
-- Name: payrolls payrolls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 16566)
-- Name: payrolls payrolls_user_id_period_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_user_id_period_month_key UNIQUE (user_id, period_month);


--
-- TOC entry 4939 (class 2606 OID 16434)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 16523)
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 16501)
-- Name: stock_logs stock_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 16406)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4935 (class 2606 OID 16404)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 16545)
-- Name: attendances attendances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4961 (class 2606 OID 16479)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 16484)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- TOC entry 4960 (class 2606 OID 16462)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4966 (class 2606 OID 16567)
-- Name: payrolls payrolls_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrolls
    ADD CONSTRAINT payrolls_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4959 (class 2606 OID 16435)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 4963 (class 2606 OID 16502)
-- Name: stock_logs stock_logs_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 16507)
-- Name: stock_logs stock_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_logs
    ADD CONSTRAINT stock_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4958 (class 2606 OID 16524)
-- Name: users users_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE SET NULL;


-- Completed on 2026-02-28 01:23:38

--
-- PostgreSQL database dump complete
--

\unrestrict vcvAJoIgaKcwIhod1EDfsXqywR2RYTngomVaaHO7ChfkT3k9kDiVV4NnTAmWqeQ

